// src/app/api/withdrawals/route.ts
// ==========================================
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Create a new withdrawal request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, crypto_type, wallet_address } = body;

    if (!amount || !crypto_type || !wallet_address) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's profile and check balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, account_balance")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const numAmount = parseFloat(amount);
    const balance = parseFloat(profile.account_balance.toString());
    
    if (numAmount > balance) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (numAmount < 10) {
      return Response.json(
        { error: "Minimum withdrawal is $10" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: numAmount,
        crypto_type,
        wallet_address,
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal creation error:", withdrawalError);
      return Response.json({ error: "Failed to create withdrawal" }, { status: 500 });
    }

    return Response.json({ withdrawal });
  } catch (err) {
    console.error("POST /api/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get user's withdrawal history
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: withdrawals, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Withdrawals fetch error:", error);
      return Response.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
    }

    return Response.json({ withdrawals: withdrawals || [] });
  } catch (err) {
    console.error("GET /api/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}