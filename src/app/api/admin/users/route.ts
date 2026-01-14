// src/app/api/admin/users/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";

export async function GET() {
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
    
    const { data: users, error } = await adminClient
      .from("profiles")
      .select(`
        *,
        active_investments(
          id,
          principal_amount,
          current_value,
          expected_return,
          status,
          start_date,
          end_date,
          investment_plans(id, name, emoji, daily_roi, total_roi, duration_days)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Admin users fetch error:", error);
      return Response.json({ 
        error: "Failed to fetch users",
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Fetched ${users?.length || 0} users for admin`);

    return Response.json({ 
      users: users || [],
      count: users?.length || 0 
    });

  } catch (err) {
    console.error("❌ GET /api/admin/users critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}