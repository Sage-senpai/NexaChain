// src/app/api/admin/manage-admins/list/route.ts
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Call the list_all_admins function
    const { data: admins, error } = await supabase.rpc("list_all_admins");

    if (error) {
      console.error("List admins error:", error);
      return Response.json({ error: "Failed to fetch admins" }, { status: 500 });
    }

    return Response.json({ admins: admins || [] });
  } catch (err) {
    console.error("GET /api/admin/manage-admins/list error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

