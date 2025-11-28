// src/app/api/deposits/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Get user's deposits
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: deposits, error } = await supabase
      .from("deposits")
      .select(`
        *,
        investment_plans (
          name,
          emoji
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Deposits fetch error:", error);
      return Response.json({ error: "Failed to fetch deposits" }, { status: 500 });
    }

    const transformedDeposits = deposits?.map(deposit => ({
      ...deposit,
      plan_name: deposit.investment_plans?.name,
      plan_emoji: deposit.investment_plans?.emoji,
    })) || [];

    return Response.json({ deposits: transformedDeposits });
  } catch (err) {
    console.error("GET /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new deposit with email notification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, crypto_type, wallet_address, amount, proof_image_base64 } = body;

    if (!plan_id || !crypto_type || !wallet_address || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan and amount
    const { data: plan, error: planError } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("id", plan_id)
      .single();
    
    if (planError || !plan) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    
    if (
      numAmount < parseFloat(plan.min_amount) ||
      (plan.max_amount && numAmount > parseFloat(plan.max_amount))
    ) {
      return Response.json(
        {
          error: `Amount must be between $${plan.min_amount} and $${plan.max_amount || "unlimited"}`,
        },
        { status: 400 }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Create deposit (without proof_image_url)
    const { data: deposit, error: depositError } = await supabase
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
      console.error("Deposit creation error:", depositError);
      return Response.json({ error: "Failed to create deposit" }, { status: 500 });
    }

    // Get all admin emails
    const { data: admins } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("role", "admin");

    // Send email notification to all admins
    if (admins && admins.length > 0 && proof_image_base64) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-deposit-email`, {
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
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the deposit if email fails
      }
    }

    return Response.json({ deposit });
  } catch (err) {
    console.error("POST /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}