// FILE 10: src/app/api/admin/withdrawals/[withdrawalId]/approve/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await params;
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

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .select(`
        *,
        profiles(email, account_balance, total_withdrawn)
      `)
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError || !withdrawal) {
      return Response.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return Response.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(withdrawal.amount);
    const currentBalance = parseFloat(withdrawal.profiles.account_balance.toString());

    // Verify user has sufficient balance
    if (currentBalance < withdrawalAmount) {
      return Response.json({ 
        error: "Insufficient balance" 
      }, { status: 400 });
    }

    // Deduct from user's balance
    const newBalance = currentBalance - withdrawalAmount;
    const { error: balanceError } = await adminClient
      .from("profiles")
      .update({ 
        account_balance: newBalance,
        total_withdrawn: parseFloat(withdrawal.profiles.total_withdrawn.toString()) + withdrawalAmount,
      })
      .eq("id", withdrawal.user_id);

    if (balanceError) {
      console.error("Balance deduction error:", balanceError);
      return Response.json({ error: "Failed to deduct balance" }, { status: 500 });
    }

    // Update withdrawal status
    const { error: updateError } = await adminClient
      .from("withdrawals")
      .update({ 
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("Withdrawal update error:", updateError);
      return Response.json({ error: "Failed to update withdrawal" }, { status: 500 });
    }

    // Create transaction record
    await adminClient.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      amount: -withdrawalAmount,
      description: `Withdrawal to ${withdrawal.crypto_type} wallet`,
      reference_id: withdrawal.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} approved withdrawal ${withdrawalId} for ${withdrawal.profiles.email}`);

    return Response.json({
      success: true,
      message: `Withdrawal approved. $${withdrawalAmount.toFixed(2)} deducted from user balance.`,
      old_balance: currentBalance,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[withdrawalId]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}