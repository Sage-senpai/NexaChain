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

    // Transform the data to match expected format
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

// Create new deposit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, crypto_type, wallet_address, amount, proof_image_url } = body;

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

    // Create deposit
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        plan_id: plan_id,
        crypto_type: crypto_type,
        wallet_address: wallet_address,
        amount: numAmount,
        proof_image_url: proof_image_url || null,
        status: "pending",
      })
      .select()
      .single();

    if (depositError) {
      console.error("Deposit creation error:", depositError);
      return Response.json({ error: "Failed to create deposit" }, { status: 500 });
    }

    return Response.json({ deposit });
  } catch (err) {
    console.error("POST /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}