// src/app/api/admin/withdrawals/[id]/reject/route.ts
// ULTRA-FIXED VERSION - Handles all database constraints
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await context.params;
    
    console.log("🔄 [REJECT WITHDRAWAL] Starting for ID:", withdrawalId);
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ [REJECT WITHDRAWAL] Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [REJECT WITHDRAWAL] User authenticated:", user.email);

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ [REJECT WITHDRAWAL] Not admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ [REJECT WITHDRAWAL] Admin verified");

    // Get withdrawal with minimal select
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, status")
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ [REJECT WITHDRAWAL] Fetch error:", withdrawalError);
      return NextResponse.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ [REJECT WITHDRAWAL] Withdrawal is null");
      return NextResponse.json({ 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }

    console.log("✅ [REJECT WITHDRAWAL] Withdrawal found:", {
      id: withdrawal.id,
      status: withdrawal.status,
      amount: withdrawal.amount
    });

    if (withdrawal.status !== "pending") {
      console.warn("⚠️ [REJECT WITHDRAWAL] Already processed:", withdrawal.status);
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    // Update withdrawal status with minimal fields
    console.log("📝 [REJECT WITHDRAWAL] Updating status...");
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "rejected"
        // Don't set rejected_at if column doesn't exist
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ [REJECT WITHDRAWAL] Update error:", updateError);
      return NextResponse.json({ 
        error: "Failed to reject withdrawal",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ [REJECT WITHDRAWAL] Status updated");

    // Try to create transaction (optional - don't fail if it errors)
    try {
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal_rejected",
        amount: 0,
        description: "Withdrawal rejected by admin. Balance remains unchanged.",
        reference_id: withdrawal.id,
        status: "completed",
      });
      console.log("✅ [REJECT WITHDRAWAL] Transaction created");
    } catch (txError) {
      console.warn("⚠️ [REJECT WITHDRAWAL] Transaction creation failed (non-critical):", txError);
    }

    console.log("🎉 [REJECT WITHDRAWAL] Success!");

    return NextResponse.json({
      success: true,
      message: "Withdrawal rejected. User balance unchanged.",
    });
  } catch (err) {
    console.error("❌ [REJECT WITHDRAWAL] Critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}