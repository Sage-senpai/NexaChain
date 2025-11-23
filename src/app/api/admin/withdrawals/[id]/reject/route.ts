// src/app/api/admin/withdrawals/[id]/reject/route.ts
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

    // If withdrawal was already approved and balance was deducted, refund it
    if (withdrawal.status === "approved") {
      // Refund the amount back to user's balance
      await supabase.rpc("credit_roi", {
        target_user_id: withdrawal.user_id,
        roi_amount: parseFloat(withdrawal.amount),
      });

      // Create refund transaction record
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "roi",
        amount: withdrawal.amount,
        description: "Withdrawal rejected - amount refunded",
        reference_id: withdrawalId,
      });
    }

    // Update withdrawal status to rejected
    await supabase
      .from("withdrawals")
      .update({
        status: "rejected",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    return Response.json({ 
      success: true,
      message: withdrawal.status === "approved" 
        ? "Withdrawal rejected and amount refunded to user"
        : "Withdrawal rejected"
    });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}