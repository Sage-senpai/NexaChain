// src/app/api/admin/withdrawals/route.ts
// ==========================================
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

    const { data: withdrawals, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin withdrawals fetch error:", error);
      return Response.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
    }

    return Response.json({ withdrawals: withdrawals || [] });
  } catch (err) {
    console.error("GET /api/admin/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
