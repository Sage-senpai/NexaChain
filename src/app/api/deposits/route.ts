// src/app/api/deposits/route.ts
// FIXED VERSION - Uses admin client for inserts to bypass RLS
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // ✅ Step 1: Authenticate user with regular client
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.email);

    // ✅ Step 2: Parse and validate request body
    const body = await request.json();
    const { plan_id, crypto_type, wallet_address, amount, proof_image_base64 } = body;

    // Validate required fields
    if (!plan_id || !crypto_type || !wallet_address || !amount) {
      console.error("❌ Missing required fields:", { plan_id, crypto_type, wallet_address, amount });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Step 3: Validate plan and amount (using regular client - read operations work with RLS)
    const { data: plan, error: planError } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("id", plan_id)
      .single();
    
    if (planError || !plan) {
      console.error("❌ Plan error:", planError);
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    
    if (
      numAmount < parseFloat(plan.min_amount) ||
      (plan.max_amount && numAmount > parseFloat(plan.max_amount))
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between $${plan.min_amount} and $${plan.max_amount || "unlimited"}`,
        },
        { status: 400 }
      );
    }

    // ✅ Step 4: Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    console.log("✅ Creating deposit for user:", user.email);

    // ✅ Step 5: Use ADMIN CLIENT to create deposit (bypasses RLS)
    const adminClient = createAdminClient();
    
    const { data: deposit, error: depositError } = await adminClient
      .from("deposits")
      .insert({
        user_id: user.id,
        plan_id: plan_id,
        crypto_type: crypto_type,
        wallet_address: wallet_address,
        amount: numAmount,
        proof_image_url: proof_image_base64 ? "email_attached" : null,
        status: "pending",
      })
      .select()
      .single();

    if (depositError) {
      console.error("❌ Deposit creation error:", depositError);
      return NextResponse.json({ 
        error: "Failed to create deposit",
        details: depositError.message 
      }, { status: 500 });
    }

    console.log("✅ Deposit created successfully:", deposit.id);

    // ✅ Step 6: Send email notification (non-blocking)
    if (proof_image_base64 && process.env.RESEND_API_KEY) {
      // Get all admin emails using admin client
      const { data: admins } = await adminClient
        .from("profiles")
        .select("email, full_name")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        // Fire and forget email
        Promise.resolve().then(async () => {
          try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-deposit-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                admins: admins,
                deposit: {
                  id: deposit.id,
                  amount: numAmount,
                  crypto_type: crypto_type,
                  plan_name: plan.name,
                  plan_emoji: plan.emoji,
                  user_name: profile?.full_name || profile?.email || "Unknown User",
                  user_email: profile?.email || user.email,
                  created_at: deposit.created_at,
                },
                proof_image: proof_image_base64,
              }),
            });
            
            if (!emailResponse.ok) {
              console.warn("⚠️ Email notification failed:", await emailResponse.text());
            } else {
              console.log("✅ Email notification sent successfully");
            }
          } catch (emailError) {
            console.warn("⚠️ Email notification error (non-critical):", emailError);
          }
        });
      }
    }

    // ✅ Return success immediately
    return NextResponse.json({ 
      deposit,
      message: "Deposit created successfully"
    });
    
  } catch (err) {
    console.error("❌ POST /api/deposits critical error:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET route for fetching user's deposit history
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Use regular client for SELECT - RLS policy allows users to view their own deposits
    const { data: deposits, error } = await supabase
      .from("deposits")
      .select(`
        *,
        investment_plans (
          name,
          emoji,
          daily_roi,
          total_roi,
          duration_days
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Deposits fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch deposits" }, { status: 500 });
    }

    return NextResponse.json({ deposits: deposits || [] });
  } catch (err) {
    console.error("GET /api/deposits error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}