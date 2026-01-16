// src/app/api/admin/deposits/[id]/reject/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: Await params for Next.js 16
    const { id: depositId } = await context.params;
    
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

    // Get deposit details
    const { data: deposit, error: depositError } = await adminClient
      .from("deposits")
      .select(`
        *,
        profiles(id, email, full_name)
      `)
      .eq("id", depositId)
      .single();

    if (depositError) {
      console.error("❌ Deposit fetch error:", depositError);
      return NextResponse.json({ 
        error: "Deposit not found",
        details: depositError.message 
      }, { status: 404 });
    }

    if (!deposit) {
      console.error("❌ Deposit is null/undefined");
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "pending") {
      return NextResponse.json({ 
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
      console.error("❌ Deposit rejection error:", updateError);
      return NextResponse.json({ error: "Failed to reject deposit" }, { status: 500 });
    }

    // Create transaction record
    await adminClient.from("transactions").insert({
      user_id: deposit.user_id,
      type: "deposit_rejected",
      amount: 0,
      description: `Deposit rejected by admin`,
      reference_id: deposit.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} rejected deposit ${depositId}`);

    return NextResponse.json({
      success: true,
      message: "Deposit rejected",
    });
  } catch (err) {
    console.error("❌ POST /api/admin/deposits/[id]/reject error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}