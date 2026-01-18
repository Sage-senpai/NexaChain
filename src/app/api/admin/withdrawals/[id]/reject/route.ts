// src/app/api/admin/withdrawals/[id]/reject/route.ts
// FIXED VERSION - Simplified admin verification
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Get withdrawal ID from params
    const { id: withdrawalId } = await context.params;
    
    console.log("🔄 Attempting to reject withdrawal:", withdrawalId);
    
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

    // ✅ Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select(`
        *,
        profiles!withdrawals_user_id_fkey(id, email, full_name, account_balance)
      `)
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ Withdrawal fetch error:", withdrawalError);
      return NextResponse.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ Withdrawal is null");
      return NextResponse.json({ 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }

    console.log("✅ Withdrawal found:", {
      id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      user: withdrawal.profiles?.email
    });

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    // ✅ Update withdrawal status
    console.log("📝 Updating withdrawal status to rejected...");
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ Withdrawal rejection error:", updateError);
      return NextResponse.json({ 
        error: "Failed to reject withdrawal",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ Withdrawal status updated to rejected");

    // ✅ Create transaction record
    console.log("📝 Creating transaction record...");
    await supabase.from("transactions").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal_rejected",
      amount: 0,
      description: `Withdrawal rejected by admin. Balance remains unchanged.`,
      reference_id: withdrawal.id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} rejected withdrawal ${withdrawalId}`);

    return NextResponse.json({
      success: true,
      message: "Withdrawal rejected. User balance unchanged.",
    });
  } catch (err) {
    console.error("❌ POST /api/admin/withdrawals/[id]/reject critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}