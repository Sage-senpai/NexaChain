// src/app/api/admin/users/[id]/activate/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Update account_status in profiles table
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ account_status: "active", updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (profileError) {
      console.error("❌ Activate profile error:", profileError);
      return Response.json({ error: "Failed to activate user" }, { status: 500 });
    }

    // Sync account_status to JWT user metadata
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { user_metadata: { account_status: "active" } }
    );

    if (authError) {
      console.error("❌ Activate auth metadata error:", authError);
    }

    console.log(`✅ Admin ${user.email} reactivated user ${targetUserId}`);
    return Response.json({ success: true, message: "User account activated" });
  } catch (err) {
    console.error("❌ POST /api/admin/users/[id]/activate error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
