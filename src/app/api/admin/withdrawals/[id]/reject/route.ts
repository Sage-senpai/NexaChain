// FILE 11: src/app/api/admin/withdrawals/[withdrawalId]/reject/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { withdrawalId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const withdrawalId = params.withdrawalId;
    const adminClient = createAdminClient();

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .select("*, profiles(email)")
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

    // Update withdrawal status
    const { error: updateError } = await adminClient
      .from("withdrawals")
      .update({ 
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("Withdrawal rejection error:", updateError);
      return Response.json({ error: "Failed to reject withdrawal" }, { status: 500 });
    }

    console.log(`✅ Admin ${user.email} rejected withdrawal ${withdrawalId}`);

    return Response.json({
      success: true,
      message: "Withdrawal rejected. User balance unchanged.",
    });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[withdrawalId]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
