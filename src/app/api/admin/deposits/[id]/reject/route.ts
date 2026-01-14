// FILE 9: src/app/api/admin/deposits/[depositId]/reject/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: depositId } = await params;
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

    // Get deposit details
    const { data: deposit, error: depositError } = await adminClient
      .from("deposits")
      .select("*, profiles(email)")
      .eq("id", depositId)
      .single();

    if (depositError || !deposit) {
      return Response.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "pending") {
      return Response.json({ 
        error: `Deposit already ${deposit.status}` 
      }, { status: 400 });
    }

    // Update deposit status
    const { error: updateError } = await adminClient
      .from("deposits")
      .update({ 
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    if (updateError) {
      console.error("Deposit rejection error:", updateError);
      return Response.json({ error: "Failed to reject deposit" }, { status: 500 });
    }

    console.log(`✅ Admin ${user.email} rejected deposit ${depositId}`);

    return Response.json({
      success: true,
      message: "Deposit rejected",
    });
  } catch (err) {
    console.error("POST /api/admin/deposits/[depositId]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}