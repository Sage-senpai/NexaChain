// src/app/api/admin/deposits/[id]/approve/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: depositId } = await params;

    // Get deposit details
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single();

    if (depositError || !deposit) {
      return Response.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Get plan details
    const { data: plan } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("id", deposit.plan_id)
      .single();

    if (!plan) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update deposit status
    await supabase
      .from("deposits")
      .update({
        status: "confirmed",
        confirmed_by: user.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    // Create active investment
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const expectedReturn =
      parseFloat(deposit.amount) * (1 + parseFloat(plan.total_roi) / 100);

    await supabase.from("active_investments").insert({
      user_id: deposit.user_id,
      plan_id: deposit.plan_id,
      deposit_id: depositId,
      principal_amount: deposit.amount,
      current_value: deposit.amount,
      expected_return: expectedReturn,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
    });

    // Update user profile
    await supabase.rpc("increment_total_invested", {
      user_id: deposit.user_id,
      amount: parseFloat(deposit.amount),
    });

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: deposit.user_id,
      type: "deposit",
      amount: deposit.amount,
      description: "Deposit confirmed",
      reference_id: depositId,
    });

    // Check if user was referred and credit referrer
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", deposit.user_id)
      .single();

    if (userProfile?.referred_by) {
      const bonusAmount =
        parseFloat(deposit.amount) *
        (parseFloat(plan.referral_bonus_percent) / 100);

      // Credit referrer's account
      await supabase.rpc("credit_referral_bonus", {
        referrer_id: userProfile.referred_by,
        bonus_amount: bonusAmount,
      });

      // Create/update referral record
      await supabase
        .from("referrals")
        .upsert({
          referrer_id: userProfile.referred_by,
          referred_id: deposit.user_id,
          bonus_amount: bonusAmount,
          status: "paid",
        });

      // Create transaction for referrer
      await supabase.from("transactions").insert({
        user_id: userProfile.referred_by,
        type: "referral_bonus",
        amount: bonusAmount,
        description: "Referral bonus from deposit",
        reference_id: depositId,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/deposits/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}