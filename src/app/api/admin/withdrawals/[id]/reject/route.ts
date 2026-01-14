// src/app/api/admin/withdrawals/[withdrawalId]/reject/route.ts
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
      console.error("❌ Auth error:", userError);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
      console.error("❌ User is not admin");
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .select(`
        *,
        profiles(id, email, full_name, account_balance)
      `)
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ Withdrawal fetch error:", withdrawalError);
      return Response.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ Withdrawal is null/undefined");
      return Response.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return Response.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    // Update withdrawal status
    const { error: updateError } = await adminClient
      .from("withdrawals")
      .update({ 
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ Withdrawal rejection error:", updateError);
      return Response.json({ error: "Failed to reject withdrawal" }, { status: 500 });
    }

    // Create transaction record to log the rejection
    await adminClient.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal_rejected",
      amount: 0,
      description: `Withdrawal rejected by admin. Balance remains unchanged.`,
      reference_id: withdrawal.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} rejected withdrawal ${withdrawalId} for ${withdrawal.profiles.email}`);

    return Response.json({
      success: true,
      message: "Withdrawal rejected. User balance unchanged.",
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        user_balance: withdrawal.profiles.account_balance,
      },
    });
  } catch (err) {
    console.error("❌ POST /api/admin/withdrawals/[withdrawalId]/reject error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}