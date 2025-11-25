
// src/app/api/admin/manage-admins/sync/route.ts
import { createClient } from "@/lib/supabase/server";

export async function POST() {
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

    // Call the sync_all_admin_roles function
    const { data, error } = await supabase.rpc("sync_all_admin_roles");

    if (error) {
      console.error("Sync roles error:", error);
      return Response.json({ error: "Failed to sync roles" }, { status: 500 });
    }

    const result = data?.[0];

    return Response.json({ 
      success: true, 
      message: result?.message || "Roles synced successfully",
      synced_count: result?.synced_count || 0
    });
  } catch (err) {
    console.error("POST /api/admin/manage-admins/sync error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}