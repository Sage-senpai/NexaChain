// src/app/api/admin/credit-roi/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

interface CreditROIRequest {
  user_id: string;
  investment_id: string;
  amount: number;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CreditROIRequest = await request.json();
    const { user_id, investment_id, amount, description } = body;

    if (!user_id || !investment_id || !amount || amount <= 0) {
      return Response.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    // Verify investment exists and belongs to user
    const { data: investment } = await supabase
      .from("active_investments")
      .select("*, investment_plans(*)")
      .eq("id", investment_id)
      .eq("user_id", user_id)
      .single();

    if (!investment) {
      return Response.json({ error: "Investment not found" }, { status: 404 });
    }

    // Credit the user's account balance
    const { error: creditError } = await supabase.rpc("credit_roi", {
      target_user_id: user_id,
      roi_amount: amount,
    });

    if (creditError) {
      console.error("Credit ROI error:", creditError);
      return Response.json({ error: "Failed to credit ROI" }, { status: 500 });
    }

    // Update investment current value
    const newCurrentValue = parseFloat(investment.current_value) + amount;
    await supabase
      .from("active_investments")
      .update({ current_value: newCurrentValue })
      .eq("id", investment_id);

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: user_id,
      type: "roi",
      amount: amount,
      description: description || `ROI credited for ${investment.investment_plans?.name || "investment"}`,
      reference_id: investment_id,
    });

    return Response.json({ 
      success: true,
      message: `Successfully credited $${amount} ROI to user account`,
      new_balance: newCurrentValue
    });
  } catch (err) {
    console.error("POST /api/admin/credit-roi error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}