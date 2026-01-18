// src/app/api/admin/deposits/[id]/reject/route.ts
// FIXED VERSION - Simplified admin verification
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Get deposit ID from params
    const { id: depositId } = await context.params;
    
    console.log("🔄 Attempting to reject deposit:", depositId);
    
    // ✅ Verify admin access
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ Not an admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ Admin verified:", user.email);

    // ✅ Get deposit details
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select(`
        *,
        profiles!deposits_user_id_fkey(id, email, full_name)
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
      console.error("❌ Deposit is null");
      return NextResponse.json({ 
        error: "Deposit not found" 
      }, { status: 404 });
    }

    console.log("✅ Deposit found:", {
      id: deposit.id,
      amount: deposit.amount,
      status: deposit.status,
      user: deposit.profiles?.email
    });

    if (deposit.status !== "pending") {
      return NextResponse.json({ 
        error: `Deposit already ${deposit.status}` 
      }, { status: 400 });
    }

    // ✅ Update deposit status
    console.log("📝 Updating deposit status to rejected...");
    const { error: updateError } = await supabase
      .from("deposits")
      .update({ 
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    if (updateError) {
      console.error("❌ Deposit rejection error:", updateError);
      return NextResponse.json({ 
        error: "Failed to reject deposit",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ Deposit status updated to rejected");

    // ✅ Create transaction record
    console.log("📝 Creating transaction record...");
    await supabase.from("transactions").insert({
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
    console.error("❌ POST /api/admin/deposits/[id]/reject critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}