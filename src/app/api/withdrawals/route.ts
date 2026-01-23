// src/app/api/withdrawals/route.ts
// FIXED VERSION - Uses admin client for inserts to bypass RLS + Email notifications to admins
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Helper function to send withdrawal request email to all admins (non-blocking)
async function sendWithdrawalRequestEmailToAdmins(withdrawalData: {
  id: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_balance: number;
}) {
  try {
    const adminClient = createAdminClient();

    // Fetch all admin emails
    const { data: admins, error: adminsError } = await adminClient
      .from("profiles")
      .select("email, full_name")
      .eq("role", "admin");

    if (adminsError || !admins || admins.length === 0) {
      console.warn("⚠️ [WITHDRAWAL] No admins found for email notification:", adminsError);
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/send-withdrawal-request-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admins,
        withdrawal: withdrawalData,
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ [WITHDRAWAL] Admin email send failed but continuing:', await response.text());
    } else {
      console.log('✅ [WITHDRAWAL] Admin notification emails sent successfully');
    }
  } catch (error) {
    console.warn('⚠️ [WITHDRAWAL] Admin email send error (non-critical):', error);
  }
}

// Create a new withdrawal request
export async function POST(request: NextRequest) {
  try {
    // ✅ Step 1: Authenticate user with regular client
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.email);

    // ✅ Step 2: Parse and validate request body
    const body = await request.json();
    const { amount, crypto_type, wallet_address } = body;

    if (!amount || !crypto_type || !wallet_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Step 3: Get user's profile and check balance (using regular client)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, account_balance, full_name, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const numAmount = parseFloat(amount);
    const balance = parseFloat(profile.account_balance.toString());
    
    if (numAmount > balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (numAmount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal is $10" },
        { status: 400 }
      );
    }

    console.log("✅ Creating withdrawal for user:", user.email);

    // ✅ Step 4: Use ADMIN CLIENT to create withdrawal (bypasses RLS)
    const adminClient = createAdminClient();
    
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: numAmount,
        crypto_type,
        wallet_address,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("❌ Withdrawal creation error:", withdrawalError);
      return NextResponse.json({ 
        error: "Failed to create withdrawal",
        details: withdrawalError.message 
      }, { status: 500 });
    }

    console.log("✅ Withdrawal created successfully:", withdrawal.id);

    // ✅ Step 5: Send email notification to all admins (non-blocking)
    Promise.resolve().then(() => {
      sendWithdrawalRequestEmailToAdmins({
        id: withdrawal.id,
        amount: numAmount,
        crypto_type,
        wallet_address,
        created_at: withdrawal.created_at,
        user_name: profile.full_name || user.email || 'Unknown User',
        user_email: profile.email || user.email || 'Unknown',
        user_balance: balance,
      });
    });
    console.log("📧 [WITHDRAWAL] Admin notification email queued");

    return NextResponse.json({ withdrawal });
  } catch (err) {
    console.error("❌ POST /api/withdrawals error", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

// Get user's withdrawal history
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Use regular client for SELECT - RLS policy allows users to view their own withdrawals
    const { data: withdrawals, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Withdrawals fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals || [] });
  } catch (err) {
    console.error("GET /api/withdrawals error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}