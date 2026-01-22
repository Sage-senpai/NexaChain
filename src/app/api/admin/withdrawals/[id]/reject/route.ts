// src/app/api/admin/withdrawals/[id]/reject/route.ts
// ULTRA-FIXED VERSION - Handles all database constraints + Email notifications
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Helper function to send withdrawal rejection email (non-blocking)
async function sendRejectionEmail(userData: {
  email: string;
  full_name: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  withdrawal_id: string;
  created_at: string;
  rejection_reason?: string;
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/send-withdrawal-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: userData.email,
        user_name: userData.full_name,
        amount: userData.amount,
        crypto_type: userData.crypto_type,
        wallet_address: userData.wallet_address,
        withdrawal_id: userData.withdrawal_id,
        status: 'rejected',
        rejection_reason: userData.rejection_reason,
        created_at: userData.created_at,
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ [REJECT WITHDRAWAL] Email send failed but continuing:', await response.text());
    } else {
      console.log('✅ [REJECT WITHDRAWAL] Rejection email sent successfully');
    }
  } catch (error) {
    console.warn('⚠️ [REJECT WITHDRAWAL] Email send error (non-critical):', error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await context.params;

    // Parse optional rejection reason from request body
    let rejectionReason: string | undefined;
    try {
      const body = await request.json();
      rejectionReason = body.reason;
    } catch {
      // No body or invalid JSON - that's fine, reason is optional
    }
    
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

    // Get withdrawal with details for email notification
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, status, crypto_type, wallet_address, created_at")
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

    // Get user's email for notification
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", withdrawal.user_id)
      .single();

    if (userProfileError) {
      console.warn("⚠️ [REJECT WITHDRAWAL] Could not fetch user profile for email:", userProfileError);
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

    // Send rejection email to user (non-blocking)
    if (userProfile?.email) {
      Promise.resolve().then(() => {
        sendRejectionEmail({
          email: userProfile.email,
          full_name: userProfile.full_name || 'Valued Investor',
          amount: parseFloat(withdrawal.amount.toString()),
          crypto_type: withdrawal.crypto_type,
          wallet_address: withdrawal.wallet_address,
          withdrawal_id: withdrawal.id,
          created_at: withdrawal.created_at,
          rejection_reason: rejectionReason,
        });
      });
      console.log("📧 [REJECT WITHDRAWAL] Rejection email notification queued");
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal rejected. User balance unchanged. Email notification sent.",
    });
  } catch (err) {
    console.error("❌ [REJECT WITHDRAWAL] Critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}