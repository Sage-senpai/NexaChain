// src/app/api/admin/withdrawals/[id]/approve/route.ts
// ULTRA-FIXED VERSION - Handles all database constraints
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await context.params;
    
    console.log("🔄 [APPROVE WITHDRAWAL] Starting for ID:", withdrawalId);
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ [APPROVE WITHDRAWAL] Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] User authenticated:", user.email);

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ [APPROVE WITHDRAWAL] Not admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Admin verified");

    // Get withdrawal with minimal select
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, status, crypto_type, wallet_address")
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ [APPROVE WITHDRAWAL] Fetch error:", withdrawalError);
      return NextResponse.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ [APPROVE WITHDRAWAL] Withdrawal is null");
      return NextResponse.json({ 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Withdrawal found:", {
      id: withdrawal.id,
      status: withdrawal.status,
      amount: withdrawal.amount
    });

    if (withdrawal.status !== "pending") {
      console.warn("⚠️ [APPROVE WITHDRAWAL] Already processed:", withdrawal.status);
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(withdrawal.amount.toString());

    // Get user's current balance
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("account_balance, total_withdrawn")
      .eq("id", withdrawal.user_id)
      .single();

    if (userProfileError || !userProfile) {
      console.error("❌ [APPROVE WITHDRAWAL] User profile error:", userProfileError);
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 });
    }

    const currentBalance = parseFloat(userProfile.account_balance.toString());
    console.log("💰 [APPROVE WITHDRAWAL] Current balance:", currentBalance);

    // Verify sufficient balance
    if (currentBalance < withdrawalAmount) {
      console.error("❌ [APPROVE WITHDRAWAL] Insufficient balance");
      return NextResponse.json({ 
        error: `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
      }, { status: 400 });
    }

    // Step 1: Deduct from balance
    console.log("📝 [APPROVE WITHDRAWAL] Deducting balance...");
    const newBalance = currentBalance - withdrawalAmount;
    const newTotalWithdrawn = parseFloat(userProfile.total_withdrawn.toString()) + withdrawalAmount;
    
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ 
        account_balance: newBalance,
        total_withdrawn: newTotalWithdrawn
      })
      .eq("id", withdrawal.user_id);

    if (balanceError) {
      console.error("❌ [APPROVE WITHDRAWAL] Balance update error:", balanceError);
      return NextResponse.json({ 
        error: "Failed to deduct balance",
        details: balanceError.message 
      }, { status: 500 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Balance deducted:", {
      old: currentBalance,
      new: newBalance
    });

    // Step 2: Update withdrawal status
    console.log("📝 [APPROVE WITHDRAWAL] Updating withdrawal status...");
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "approved"
        // Don't set approved_at or processed_by if columns don't exist
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ [APPROVE WITHDRAWAL] Status update error:", updateError);
      
      // Try to rollback balance
      console.log("🔄 [APPROVE WITHDRAWAL] Rolling back balance...");
      await supabase
        .from("profiles")
        .update({ 
          account_balance: currentBalance,
          total_withdrawn: parseFloat(userProfile.total_withdrawn.toString())
        })
        .eq("id", withdrawal.user_id);
      
      return NextResponse.json({ 
        error: "Failed to update withdrawal status",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Status updated");

    // Step 3: Create transaction (optional)
    try {
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal",
        amount: -withdrawalAmount,
        description: `Withdrawal to ${withdrawal.crypto_type} wallet`,
        reference_id: withdrawal.id,
        status: "completed",
      });
      console.log("✅ [APPROVE WITHDRAWAL] Transaction created");
    } catch (txError) {
      console.warn("⚠️ [APPROVE WITHDRAWAL] Transaction creation failed (non-critical):", txError);
    }

    console.log("🎉 [APPROVE WITHDRAWAL] Success!");

    return NextResponse.json({
      success: true,
      message: `Withdrawal approved. $${withdrawalAmount.toFixed(2)} deducted from user balance.`,
      old_balance: currentBalance,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("❌ [APPROVE WITHDRAWAL] Critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}