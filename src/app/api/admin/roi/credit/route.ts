// FILE 7: src/app/api/admin/roi/credit/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
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

    const adminClient = createAdminClient();
    const roiAmount = parseFloat(amount);

    // Get investment details
    const { data: investment, error: invError } = await adminClient
      .from("active_investments")
      .select(`
        *,
        investment_plans(name, emoji),
        profiles(email, account_balance)
      `)
      .eq("id", investment_id)
      .single();

    if (invError || !investment) {
      return Response.json({ error: "Investment not found" }, { status: 404 });
    }

    const oldInvestmentValue = parseFloat(investment.current_value);
    const newInvestmentValue = oldInvestmentValue + roiAmount;

    const oldUserBalance = parseFloat(investment.profiles.account_balance.toString());
    const newUserBalance = oldUserBalance + roiAmount;

    // Update investment value
    const { error: invUpdateError } = await adminClient
      .from("active_investments")
      .update({ current_value: newInvestmentValue })
      .eq("id", investment_id);

    if (invUpdateError) {
      console.error("Investment update error:", invUpdateError);
      return Response.json({ error: "Failed to update investment" }, { status: 500 });
    }

    // Credit user balance
    const { error: balanceError } = await adminClient
      .from("profiles")
      .update({ account_balance: newUserBalance })
      .eq("id", investment.user_id);

    if (balanceError) {
      console.error("Balance update error:", balanceError);
      return Response.json({ error: "Failed to update user balance" }, { status: 500 });
    }

    // Create transaction record
    await adminClient.from("transactions").insert({
      user_id: investment.user_id,
      type: "roi",
      amount: roiAmount,
      description: description || `ROI credited for ${investment.investment_plans?.name || "investment"}`,
      reference_id: investment_id,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} credited $${roiAmount} ROI to ${investment.profiles.email}`);

    return Response.json({
      success: true,
      message: `Successfully credited $${roiAmount.toFixed(2)} ROI`,
      investment: {
        old_value: oldInvestmentValue,
        new_value: newInvestmentValue,
      },
      user_balance: {
        old_balance: oldUserBalance,
        new_balance: newUserBalance,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/roi/credit error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}