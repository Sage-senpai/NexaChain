// src/app/api/admin/withdrawals/[id]/approve/route.ts
// ==========================================
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

    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (!withdrawal) {
      return Response.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    // Update withdrawal status
    await supabase
      .from("withdrawals")
      .update({
        status: "approved",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    // Deduct from user balance using RPC
    await supabase.rpc("process_withdrawal", {
      user_id: withdrawal.user_id,
      withdrawal_amount: parseFloat(withdrawal.amount),
    });

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      amount: withdrawal.amount,
      description: "Withdrawal approved",
      reference_id: withdrawalId,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
