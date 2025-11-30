// src/app/api/admin/roi/credit/route.ts
// NEW FILE - Create this file for ROI crediting
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

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

    const body = await request.json();
    const { investment_id, amount, description } = body;

    if (!investment_id || !amount || amount <= 0) {
      return Response.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    // Get investment details
    const { data: investment, error: invError } = await supabase
      .from("active_investments")
      .select("*, investment_plans(*)")
      .eq("id", investment_id)
      .single();

    if (invError || !investment) {
      return Response.json({ error: "Investment not found" }, { status: 404 });
    }

    const roiAmount = parseFloat(amount);
    const oldValue = parseFloat(investment.current_value);
    const newValue = oldValue + roiAmount;

    // Update investment current value
    const { error: updateError } = await supabase
      .from("active_investments")
      .update({ 
        current_value: newValue,
        updated_at: new Date().toISOString()
      })
      .eq("id", investment_id);

    if (updateError) {
      console.error("Investment update error:", updateError);
      return Response.json({ error: "Failed to update investment" }, { status: 500 });
    }

    // Credit user's account balance
    const { error: balanceError } = await supabase.rpc("credit_roi", {
      target_user_id: investment.user_id,
      roi_amount: roiAmount,
    });

    if (balanceError) {
      console.error("Balance credit error:", balanceError);
      // Try to rollback investment update
      await supabase
        .from("active_investments")
        .update({ current_value: oldValue })
        .eq("id", investment_id);
      
      return Response.json({ error: "Failed to credit balance" }, { status: 500 });
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: investment.user_id,
      type: "roi_credit",
      amount: roiAmount,
      description: description || `ROI credited for ${investment.investment_plans?.name || 'investment'}`,
      reference_id: investment_id,
      status: "completed",
    });

    return Response.json({
      success: true,
      message: `Successfully credited $${roiAmount.toFixed(2)} ROI`,
      old_value: oldValue,
      new_value: newValue,
      credited_amount: roiAmount,
    });
  } catch (err) {
    console.error("POST /api/admin/roi/credit error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}