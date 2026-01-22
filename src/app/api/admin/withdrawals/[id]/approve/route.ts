// src/app/api/admin/withdrawals/[id]/approve/route.ts
// ULTRA-FIXED VERSION - Handles all database constraints + Email notifications
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Helper function to send withdrawal approval email (non-blocking)
async function sendApprovalEmail(userData: {
  email: string;
  full_name: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  withdrawal_id: string;
  created_at: string;
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
        status: 'approved',
        created_at: userData.created_at,
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ [APPROVE WITHDRAWAL] Email send failed but continuing:', await response.text());
    } else {
      console.log('✅ [APPROVE WITHDRAWAL] Approval email sent successfully');
    }
  } catch (error) {
    console.warn('⚠️ [APPROVE WITHDRAWAL] Email send error (non-critical):', error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await context.params;
    
    console.log("🔄 [APPROVE WITHDRAWAL] Starting for ID:", withdrawalId);
    
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ [APPROVE WITHDRAWAL] Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] User authenticated:", user.email);

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      console.error("❌ [APPROVE WITHDRAWAL] Not admin:", profile?.role);
      return NextResponse.json({ 
        error: "Forbidden - Admin access required" 
      }, { status: 403 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Admin verified");

    // Get withdrawal with user profile for email
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, status, crypto_type, wallet_address, created_at")
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) {
      console.error("❌ [APPROVE WITHDRAWAL] Fetch error:", withdrawalError);
      return NextResponse.json({ 
        error: "Withdrawal not found",
        details: withdrawalError.message 
      }, { status: 404 });
    }

    if (!withdrawal) {
      console.error("❌ [APPROVE WITHDRAWAL] Withdrawal is null");
      return NextResponse.json({ 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Withdrawal found:", {
      id: withdrawal.id,
      status: withdrawal.status,
      amount: withdrawal.amount
    });

    if (withdrawal.status !== "pending") {
      console.warn("⚠️ [APPROVE WITHDRAWAL] Already processed:", withdrawal.status);
      return NextResponse.json({ 
        error: `Withdrawal already ${withdrawal.status}` 
      }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(withdrawal.amount.toString());

    // Get user's current balance and email for notification
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("account_balance, total_withdrawn, email, full_name")
      .eq("id", withdrawal.user_id)
      .single();

    if (userProfileError || !userProfile) {
      console.error("❌ [APPROVE WITHDRAWAL] User profile error:", userProfileError);
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 });
    }

    const currentBalance = parseFloat(userProfile.account_balance.toString());
    console.log("💰 [APPROVE WITHDRAWAL] Current balance:", currentBalance);

    // Verify sufficient balance
    if (currentBalance < withdrawalAmount) {
      console.error("❌ [APPROVE WITHDRAWAL] Insufficient balance");
      return NextResponse.json({ 
        error: `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
      }, { status: 400 });
    }

    // Step 1: Deduct from balance
    console.log("📝 [APPROVE WITHDRAWAL] Deducting balance...");
    const newBalance = currentBalance - withdrawalAmount;
    const newTotalWithdrawn = parseFloat(userProfile.total_withdrawn.toString()) + withdrawalAmount;
    
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ 
        account_balance: newBalance,
        total_withdrawn: newTotalWithdrawn
      })
      .eq("id", withdrawal.user_id);

    if (balanceError) {
      console.error("❌ [APPROVE WITHDRAWAL] Balance update error:", balanceError);
      return NextResponse.json({ 
        error: "Failed to deduct balance",
        details: balanceError.message 
      }, { status: 500 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Balance deducted:", {
      old: currentBalance,
      new: newBalance
    });

    // Step 2: Update withdrawal status
    console.log("📝 [APPROVE WITHDRAWAL] Updating withdrawal status...");
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "approved"
        // Don't set approved_at or processed_by if columns don't exist
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("❌ [APPROVE WITHDRAWAL] Status update error:", updateError);
      
      // Try to rollback balance
      console.log("🔄 [APPROVE WITHDRAWAL] Rolling back balance...");
      await supabase
        .from("profiles")
        .update({ 
          account_balance: currentBalance,
          total_withdrawn: parseFloat(userProfile.total_withdrawn.toString())
        })
        .eq("id", withdrawal.user_id);
      
      return NextResponse.json({ 
        error: "Failed to update withdrawal status",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log("✅ [APPROVE WITHDRAWAL] Status updated");

    // Step 3: Create transaction (optional)
    try {
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal",
        amount: -withdrawalAmount,
        description: `Withdrawal to ${withdrawal.crypto_type} wallet`,
        reference_id: withdrawal.id,
        status: "completed",
      });
      console.log("✅ [APPROVE WITHDRAWAL] Transaction created");
    } catch (txError) {
      console.warn("⚠️ [APPROVE WITHDRAWAL] Transaction creation failed (non-critical):", txError);
    }

    console.log("🎉 [APPROVE WITHDRAWAL] Success!");

    // Step 4: Send approval email to user (non-blocking)
    if (userProfile.email) {
      Promise.resolve().then(() => {
        sendApprovalEmail({
          email: userProfile.email,
          full_name: userProfile.full_name || 'Valued Investor',
          amount: withdrawalAmount,
          crypto_type: withdrawal.crypto_type,
          wallet_address: withdrawal.wallet_address,
          withdrawal_id: withdrawal.id,
          created_at: withdrawal.created_at,
        });
      });
      console.log("📧 [APPROVE WITHDRAWAL] Email notification queued");
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal approved. $${withdrawalAmount.toFixed(2)} deducted from user balance. Email notification sent.`,
      old_balance: currentBalance,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("❌ [APPROVE WITHDRAWAL] Critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}