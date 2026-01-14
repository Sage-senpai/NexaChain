// FILE 8: src/app/api/admin/deposits/[depositId]/approve/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: depositId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Get deposit details with plan info
    const { data: deposit, error: depositError } = await adminClient
      .from("deposits")
      .select(`
        *,
        investment_plans(*),
        profiles(email, full_name, referred_by)
      `)
      .eq("id", depositId)
      .single();

    if (depositError || !deposit) {
      return Response.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "pending") {
      return Response.json({ 
        error: `Deposit already ${deposit.status}` 
      }, { status: 400 });
    }

    const plan = deposit.investment_plans;
    const depositAmount = parseFloat(deposit.amount);

    // Calculate investment details
    const dailyRoi = plan.daily_roi || 0;
    const totalRoi = plan.total_roi || 0;
    const durationDays = plan.duration_days || 30;
    
    const expectedReturn = depositAmount * (totalRoi / 100);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Start transaction: Update deposit status
    const { error: updateError } = await adminClient
      .from("deposits")
      .update({ 
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    if (updateError) {
      console.error("Deposit update error:", updateError);
      return Response.json({ error: "Failed to update deposit" }, { status: 500 });
    }

    // Create active investment
    const { data: investment, error: investmentError } = await adminClient
      .from("active_investments")
      .insert({
        user_id: deposit.user_id,
        deposit_id: deposit.id,
        plan_id: deposit.plan_id,
        principal_amount: depositAmount,
        current_value: depositAmount,
        expected_return: expectedReturn,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (investmentError) {
      console.error("Investment creation error:", investmentError);
      return Response.json({ error: "Failed to create investment" }, { status: 500 });
    }

    // Update user's total_invested
    const { error: profileUpdateError } = await adminClient
      .rpc("increment_total_invested", {
        user_id_param: deposit.user_id,
        amount_param: depositAmount,
      });

    if (profileUpdateError) {
      console.error("Profile update error:", profileUpdateError);
    }

    // Handle referral bonus
    if (deposit.profiles.referred_by && plan.referral_bonus_percent > 0) {
      const bonusAmount = depositAmount * (plan.referral_bonus_percent / 100);

      // Credit referrer's balance
      await adminClient.rpc("credit_referral_bonus", {
        referrer_id_param: deposit.profiles.referred_by,
        bonus_amount_param: bonusAmount,
      });

      // Create referral bonus transaction
      await adminClient.from("transactions").insert({
        user_id: deposit.profiles.referred_by,
        type: "referral_bonus",
        amount: bonusAmount,
        description: `Referral bonus from ${deposit.profiles.email || "user"}'s deposit`,
        reference_id: deposit.id,
        status: "completed",
      });

      console.log(`✅ Credited $${bonusAmount} referral bonus`);
    }

    // Create deposit transaction
    await adminClient.from("transactions").insert({
      user_id: deposit.user_id,
      type: "deposit",
      amount: depositAmount,
      description: `Deposit for ${plan.name}`,
      reference_id: deposit.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} approved deposit ${depositId}`);

    return Response.json({
      success: true,
      message: "Deposit approved and investment activated",
      investment,
    });
  } catch (err) {
    console.error("POST /api/admin/deposits/[depositId]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}