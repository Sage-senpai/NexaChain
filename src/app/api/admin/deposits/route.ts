// src/app/api/admin/deposits/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Get status filter from query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    
    let query = adminClient
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

    // Apply status filter if provided
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: deposits, error } = await query;

    if (error) {
      console.error("❌ Admin deposits fetch error:", error);
      return Response.json({ 
        error: "Failed to fetch deposits",
        details: error.message 
      }, { status: 500 });
    }

    const formattedDeposits = deposits?.map(d => ({
      ...d,
      user_email: d.profiles?.email || 'Unknown',
      user_name: d.profiles?.full_name || 'Unknown',
      plan_name: d.investment_plans?.name || 'Unknown',
      plan_emoji: d.investment_plans?.emoji || '💰',
      plan_daily_roi: d.investment_plans?.daily_roi,
      plan_total_roi: d.investment_plans?.total_roi,
      plan_duration_days: d.investment_plans?.duration_days,
      plan_referral_bonus_percent: d.investment_plans?.referral_bonus_percent,
    })) || [];

    console.log(`✅ Fetched ${formattedDeposits.length} deposits for admin${statusFilter ? ` (${statusFilter})` : ""}`);

    return Response.json({ 
      deposits: formattedDeposits,
      count: formattedDeposits.length,
      status_filter: statusFilter || "all"
    });

  } catch (err) {
    console.error("❌ GET /api/admin/deposits critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}