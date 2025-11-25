// src/app/api/admin/manage-admins/remove/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Prevent removing yourself
    if (email === user.email) {
      return Response.json({ error: "Cannot remove your own admin access" }, { status: 400 });
    }

    // Call the remove_admin_role function
    const { data, error } = await supabase.rpc("remove_admin_role", {
      user_email: email,
    });

    if (error) {
      console.error("Remove admin error:", error);
      return Response.json({ error: "Failed to remove admin" }, { status: 500 });
    }

    const result = data?.[0];
    
    if (!result?.success) {
      return Response.json({ error: result?.message || "Failed to remove admin" }, { status: 400 });
    }

    return Response.json({ 
      success: true, 
      message: result.message 
    });
  } catch (err) {
    console.error("POST /api/admin/manage-admins/remove error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
