// src/app/api/admin/deposits/route.ts
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

    const { data: deposits, error } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin deposits fetch error:", error);
      return Response.json({ error: "Failed to fetch deposits" }, { status: 500 });
    }

    return Response.json({ deposits: deposits || [] });
  } catch (err) {
    console.error("GET /api/admin/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
