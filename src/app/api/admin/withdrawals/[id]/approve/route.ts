// src/app/api/admin/withdrawals/[id]/approve/route.ts
// FIXED VERSION - Simplified admin verification
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Get withdrawal ID from params
    const { id: withdrawalId } = await context.params;
    
    console.log("🔄 Attempting to approve withdrawal:", withdrawalId);
    
    // ✅ Verify admin access
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check admin role
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

    // ✅ Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select(`
        *,
        profiles!withdrawals_user_id_fkey(
          id,
          email,
          full_name,
          account_balance,
          total_withdrawn
        )
      `)
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ Withdrawal fetch error:", withdrawalError);
      return NextResponse.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ Withdrawal is null");
      return NextResponse.json({ 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }

    console.log("✅ Withdrawal found:", {
      id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      user: withdrawal.profiles?.email
    });

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(withdrawal.amount);
    const currentBalance = parseFloat(withdrawal.profiles.account_balance.toString());

    // ✅ Verify user has sufficient balance
    if (currentBalance < withdrawalAmount) {
      return NextResponse.json({ 
        error: `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
      }, { status: 400 });
    }

    // ✅ Step 1: Deduct from user's balance
    console.log("💰 Deducting balance...");
    const newBalance = currentBalance - withdrawalAmount;
    const newTotalWithdrawn = parseFloat(withdrawal.profiles.total_withdrawn.toString()) + withdrawalAmount;
    
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ 
        account_balance: newBalance,
        total_withdrawn: newTotalWithdrawn,
      })
      .eq("id", withdrawal.user_id);

    if (balanceError) {
      console.error("❌ Balance deduction error:", balanceError);
      return NextResponse.json({ 
        error: "Failed to deduct balance",
        details: balanceError.message 
      }, { status: 500 });
    }

    console.log("✅ Balance deducted successfully");

    // ✅ Step 2: Update withdrawal status
    console.log("📝 Updating withdrawal status...");
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "approved",
        approved_at: new Date().toISOString(),
        processed_by: user.id
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ Withdrawal update error:", updateError);
      // Try to rollback balance
      await supabase
        .from("profiles")
        .update({ 
          account_balance: currentBalance,
          total_withdrawn: parseFloat(withdrawal.profiles.total_withdrawn.toString())
        })
        .eq("id", withdrawal.user_id);
      
      return NextResponse.json({ 
        error: "Failed to update withdrawal",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ Withdrawal status updated");

    // ✅ Step 3: Create transaction record
    console.log("📝 Creating transaction record...");
    await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      amount: -withdrawalAmount,
      description: `Withdrawal to ${withdrawal.crypto_type} wallet`,
      reference_id: withdrawal.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} approved withdrawal ${withdrawalId}`);

    return NextResponse.json({
      success: true,
      message: `Withdrawal approved. $${withdrawalAmount.toFixed(2)} deducted from user balance.`,
      old_balance: currentBalance,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("❌ POST /api/admin/withdrawals/[id]/approve critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}