// src/app/api/admin/withdrawals/[id]/approve/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: Await params for Next.js 16
    const { id: withdrawalId } = await context.params;
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
      console.error("❌ User is not admin");
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .select(`
        *,
        profiles(
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
      console.error("❌ Withdrawal is null/undefined");
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(withdrawal.amount);
    const currentBalance = parseFloat(withdrawal.profiles.account_balance.toString());

    // Verify user has sufficient balance
    if (currentBalance < withdrawalAmount) {
      return NextResponse.json({ 
        error: `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
      }, { status: 400 });
    }

    // Step 1: Deduct from user's balance
    const newBalance = currentBalance - withdrawalAmount;
    const { error: balanceError } = await adminClient
      .from("profiles")
      .update({ 
        account_balance: newBalance,
        total_withdrawn: parseFloat(withdrawal.profiles.total_withdrawn.toString()) + withdrawalAmount,
      })
      .eq("id", withdrawal.user_id);

    if (balanceError) {
      console.error("❌ Balance deduction error:", balanceError);
      return NextResponse.json({ error: "Failed to deduct balance" }, { status: 500 });
    }

    // Step 2: Update withdrawal status
    const { error: updateError } = await adminClient
      .from("withdrawals")
      .update({ 
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ Withdrawal update error:", updateError);
      return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 });
    }

    // Step 3: Create transaction record
    await adminClient.from("transactions").insert({
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
    console.error("❌ POST /api/admin/withdrawals/[id]/approve error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}