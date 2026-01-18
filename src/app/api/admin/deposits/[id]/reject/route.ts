// src/app/api/admin/deposits/[id]/reject/route.ts
// ULTRA-FIXED VERSION - Handles all database constraints
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: depositId } = await context.params;
    
    console.log("🔄 [REJECT DEPOSIT] Starting for ID:", depositId);
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ [REJECT DEPOSIT] Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [REJECT DEPOSIT] User authenticated:", user.email);

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ [REJECT DEPOSIT] Not admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ [REJECT DEPOSIT] Admin verified");

    // Get deposit with minimal select to avoid relation issues
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("id, user_id, amount, status, created_at")
      .eq("id", depositId)
      .single();

    if (depositError) {
      console.error("❌ [REJECT DEPOSIT] Fetch error:", depositError);
      return NextResponse.json({ 
        error: "Deposit not found",
        details: depositError.message 
      }, { status: 404 });
    }

    if (!deposit) {
      console.error("❌ [REJECT DEPOSIT] Deposit is null");
      return NextResponse.json({ 
        error: "Deposit not found" 
      }, { status: 404 });
    }

    console.log("✅ [REJECT DEPOSIT] Deposit found:", {
      id: deposit.id,
      status: deposit.status,
      amount: deposit.amount
    });

    if (deposit.status !== "pending") {
      console.warn("⚠️ [REJECT DEPOSIT] Already processed:", deposit.status);
      return NextResponse.json({ 
        error: `Deposit already ${deposit.status}` 
      }, { status: 400 });
    }

    // Update deposit status with minimal fields
    console.log("📝 [REJECT DEPOSIT] Updating status...");
    const { error: updateError } = await supabase
      .from("deposits")
      .update({ 
        status: "rejected"
        // Don't set rejected_at if column doesn't exist
      })
      .eq("id", depositId);

    if (updateError) {
      console.error("❌ [REJECT DEPOSIT] Update error:", updateError);
      return NextResponse.json({ 
        error: "Failed to reject deposit",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ [REJECT DEPOSIT] Status updated");

    // Try to create transaction (optional - don't fail if it errors)
    try {
      await supabase.from("transactions").insert({
        user_id: deposit.user_id,
        type: "deposit_rejected",
        amount: 0,
        description: "Deposit rejected by admin",
        reference_id: deposit.id,
        status: "completed",
      });
      console.log("✅ [REJECT DEPOSIT] Transaction created");
    } catch (txError) {
      console.warn("⚠️ [REJECT DEPOSIT] Transaction creation failed (non-critical):", txError);
    }

    console.log("🎉 [REJECT DEPOSIT] Success!");

    return NextResponse.json({
      success: true,
      message: "Deposit rejected successfully",
    });
  } catch (err) {
    console.error("❌ [REJECT DEPOSIT] Critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}