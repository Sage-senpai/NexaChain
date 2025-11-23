// src/app/api/admin/withdrawals/[id]/approve/route.ts
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: withdrawalId } = await params;

    // Get withdrawal details
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (!withdrawal) {
      return Response.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return Response.json({ error: "Withdrawal already processed" }, { status: 400 });
    }

    // Check if user has sufficient balance
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("account_balance")
      .eq("id", withdrawal.user_id)
      .single();

    if (!userProfile || parseFloat(userProfile.account_balance) < parseFloat(withdrawal.amount)) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Update withdrawal status to approved (admin has reviewed and will send funds)
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({
        status: "approved",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) throw updateError;

    // Deduct from user balance only after approval
    const { error: balanceError } = await supabase.rpc("process_withdrawal", {
      user_id: withdrawal.user_id,
      withdrawal_amount: parseFloat(withdrawal.amount),
    });

    if (balanceError) {
      console.error("Balance deduction error:", balanceError);
      // Rollback withdrawal status if balance update fails
      await supabase
        .from("withdrawals")
        .update({ status: "pending" })
        .eq("id", withdrawalId);
      
      return Response.json({ error: "Failed to process withdrawal" }, { status: 500 });
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      amount: withdrawal.amount,
      description: `Withdrawal approved - ${withdrawal.crypto_type} to ${withdrawal.wallet_address.substring(0, 10)}...`,
      reference_id: withdrawalId,
    });

    return Response.json({ 
      success: true,
      message: "Withdrawal approved. Balance deducted. Please send funds to user's wallet."
    });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}