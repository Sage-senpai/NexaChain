// src/app/api/admin/deposits/route.ts
// FIXED VERSION - Now includes user email and plan details
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ FIXED: Now joins with profiles to get user email and plan details
    const { data: deposits, error } = await supabase
      .from("deposits")
      .select(`
        *,
        profiles!deposits_user_id_fkey (
          email,
          full_name
        ),
        investment_plans (
          name,
          emoji,
          daily_roi,
          total_roi,
          duration_days,
          referral_bonus_percent
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin deposits fetch error:", error);
      return Response.json({ error: "Failed to fetch deposits" }, { status: 500 });
    }

    // Transform data to flatten user and plan info
    const transformedDeposits = deposits?.map((deposit: any) => ({
      ...deposit,
      user_email: deposit.profiles?.email || 'Unknown',
      user_name: deposit.profiles?.full_name || deposit.profiles?.email || 'Unknown User',
      plan_name: deposit.investment_plans?.name || 'Unknown Plan',
      plan_emoji: deposit.investment_plans?.emoji || '📊',
      plan_daily_roi: deposit.investment_plans?.daily_roi,
      plan_total_roi: deposit.investment_plans?.total_roi,
      plan_duration_days: deposit.investment_plans?.duration_days,
    })) || [];

    return Response.json({ deposits: transformedDeposits });
  } catch (err) {
    console.error("GET /api/admin/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}