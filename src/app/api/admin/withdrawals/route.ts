// src/app/api/admin/withdrawals/route.ts
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
      .from("withdrawals")
      .select(`
        *,
        profiles!withdrawals_user_id_fkey (
          email,
          full_name,
          account_balance,
          total_withdrawn
        )
      `)
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: withdrawals, error } = await query;

    if (error) {
      console.error("❌ Admin withdrawals fetch error:", error);
      return Response.json({ 
        error: "Failed to fetch withdrawals",
        details: error.message 
      }, { status: 500 });
    }

    const formattedWithdrawals = withdrawals?.map(w => ({
      ...w,
      user_email: w.profiles?.email || 'Unknown',
      user_name: w.profiles?.full_name || 'Unknown',
      user_account_balance: w.profiles?.account_balance,
      user_total_withdrawn: w.profiles?.total_withdrawn,
    })) || [];

    console.log(`✅ Fetched ${formattedWithdrawals.length} withdrawals for admin${statusFilter ? ` (${statusFilter})` : ""}`);

    return Response.json({ 
      withdrawals: formattedWithdrawals,
      count: formattedWithdrawals.length,
      status_filter: statusFilter || "all"
    });

  } catch (err) {
    console.error("❌ GET /api/admin/withdrawals critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}