// src/app/api/admin/users/route.ts
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

    // Fetch all users with their investment data
    const { data: users, error } = await supabase
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
          investment_plans(name, emoji)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Users fetch error:", error);
      return Response.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return Response.json({ users: users || [] });
  } catch (err) {
    console.error("GET /api/admin/users error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}