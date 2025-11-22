// src/app/api/investments/route.ts
// ==========================================
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: investments, error } = await supabase
      .from("active_investments")
      .select(`
        *,
        investment_plans (
          name,
          emoji,
          daily_roi,
          duration_days
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Investments fetch error:", error);
      return Response.json({ error: "Failed to fetch investments" }, { status: 500 });
    }

    const transformedInvestments = investments?.map(inv => ({
      ...inv,
      plan_name: inv.investment_plans?.name,
      plan_emoji: inv.investment_plans?.emoji,
      daily_roi: inv.investment_plans?.daily_roi,
      duration_days: inv.investment_plans?.duration_days,
    })) || [];

    return Response.json({ investments: transformedInvestments });
  } catch (err) {
    console.error("GET /api/investments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}