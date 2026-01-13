// FILE 3: src/app/api/admin/withdrawals/route.ts
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
    
    const { data: withdrawals, error } = await adminClient
      .from("withdrawals")
      .select(`
        *,
        profiles!withdrawals_user_id_fkey (
          email,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

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
    })) || [];

    console.log(`✅ Fetched ${formattedWithdrawals.length} withdrawals for admin`);

    return Response.json({ 
      withdrawals: formattedWithdrawals,
      count: formattedWithdrawals.length 
    });

  } catch (err) {
    console.error("❌ GET /api/admin/withdrawals critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}
