// src/app/api/admin/deposits/[id]/approve/route.ts
// FIXED VERSION - Simplified admin verification & better error handling
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Get deposit ID from params
    const { id: depositId } = await context.params;
    
    console.log("🔄 Attempting to approve deposit:", depositId);
    
    // ✅ Verify admin access using server client
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check admin role directly from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ Not an admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ Admin verified:", user.email);

    // ✅ Get deposit with related data using server client (has admin access)
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select(`
        *,
        investment_plans(
          id,
          name,
          emoji,
          daily_roi,
          total_roi,
          duration_days,
          referral_bonus_percent
        ),
        profiles!deposits_user_id_fkey(
          id,
          email,
          full_name,
          referred_by,
          account_balance
        )
      `)
      .eq("id", depositId)
      .single();

    if (depositError) {
      console.error("❌ Deposit fetch error:", depositError);
      return NextResponse.json({ 
        error: "Deposit not found",
        details: depositError.message 
      }, { status: 404 });
    }

    if (!deposit) {
      console.error("❌ Deposit is null");
      return NextResponse.json({ 
        error: "Deposit not found" 
      }, { status: 404 });
    }

    console.log("✅ Deposit found:", {
      id: deposit.id,
      amount: deposit.amount,
      status: deposit.status,
      user: deposit.profiles?.email
    });

    // Check status
    if (deposit.status !== "pending") {
      return NextResponse.json({ 
        error: `Deposit already ${deposit.status}` 
      }, { status: 400 });
    }

    const plan = deposit.investment_plans;
    if (!plan) {
      return NextResponse.json({ 
        error: "Investment plan not found" 
      }, { status: 404 });
    }

    const depositAmount = parseFloat(deposit.amount);
    const dailyRoi = plan.daily_roi || 0;
    const totalRoi = plan.total_roi || 0;
    const durationDays = plan.duration_days || 30;
    
    const expectedReturn = depositAmount * (totalRoi / 100);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // ✅ Step 1: Update deposit status
    console.log("📝 Updating deposit status...");
    const { error: updateError } = await supabase
      .from("deposits")
      .update({ 
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id
      })
      .eq("id", depositId);

    if (updateError) {
      console.error("❌ Deposit update error:", updateError);
      return NextResponse.json({ 
        error: "Failed to update deposit",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ Deposit status updated");

    // ✅ Step 2: Create active investment
    console.log("💰 Creating active investment...");
    const { data: investment, error: investmentError } = await supabase
      .from("active_investments")
      .insert({
        user_id: deposit.user_id,
        deposit_id: deposit.id,
        plan_id: deposit.plan_id,
        principal_amount: depositAmount,
        current_value: depositAmount,
        expected_return: depositAmount + expectedReturn,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (investmentError) {
      console.error("❌ Investment creation error:", investmentError);
      // Try to rollback deposit status
      await supabase
        .from("deposits")
        .update({ status: "pending" })
        .eq("id", depositId);
      
      return NextResponse.json({ 
        error: "Failed to create investment",
        details: investmentError.message 
      }, { status: 500 });
    }

    console.log("✅ Active investment created");

    // ✅ Step 3: Update user's total_invested
    console.log("📊 Updating user stats...");
    const currentTotalInvested = parseFloat(deposit.profiles.account_balance?.toString() || "0");
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        total_invested: currentTotalInvested + depositAmount
      })
      .eq("id", deposit.user_id);

    if (profileUpdateError) {
      console.warn("⚠️ Profile update error (non-critical):", profileUpdateError);
    }

    // ✅ Step 4: Handle referral bonus if applicable
    if (deposit.profiles.referred_by && plan.referral_bonus_percent > 0) {
      console.log("🎁 Processing referral bonus...");
      const bonusAmount = depositAmount * (plan.referral_bonus_percent / 100);

      try {
        // Get referrer's current balance
        const { data: referrer } = await supabase
          .from("profiles")
          .select("account_balance, total_referral_bonus")
          .eq("id", deposit.profiles.referred_by)
          .single();

        if (referrer) {
          const newBalance = parseFloat(referrer.account_balance.toString()) + bonusAmount;
          const newTotalBonus = parseFloat(referrer.total_referral_bonus.toString()) + bonusAmount;

          await supabase
            .from("profiles")
            .update({
              account_balance: newBalance,
              total_referral_bonus: newTotalBonus
            })
            .eq("id", deposit.profiles.referred_by);

          await supabase.from("transactions").insert({
            user_id: deposit.profiles.referred_by,
            type: "referral_bonus",
            amount: bonusAmount,
            description: `Referral bonus from ${deposit.profiles.email || "user"}'s deposit`,
            reference_id: deposit.id,
            status: "completed",
          });

          console.log(`✅ Credited $${bonusAmount.toFixed(2)} referral bonus`);
        }
      } catch (err) {
        console.error("⚠️ Referral bonus error (non-critical):", err);
      }
    }

    // ✅ Step 5: Create deposit transaction
    console.log("📝 Creating transaction record...");
    await supabase.from("transactions").insert({
      user_id: deposit.user_id,
      type: "deposit",
      amount: depositAmount,
      description: `Deposit for ${plan.name}`,
      reference_id: deposit.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} approved deposit ${depositId}`);

    return NextResponse.json({
      success: true,
      message: "Deposit approved and investment activated",
      investment,
    });
  } catch (err) {
    console.error("❌ POST /api/admin/deposits/[id]/approve critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}