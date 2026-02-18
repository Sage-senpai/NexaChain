// src/app/api/admin/users/[id]/deactivate/route.ts
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
      .update({ account_status: "deactivated", updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (profileError) {
      console.error("❌ Deactivate profile error:", profileError);
      return Response.json({ error: "Failed to deactivate user" }, { status: 500 });
    }

    // Sync account_status to JWT user metadata so middleware can read it without a DB call
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { user_metadata: { account_status: "deactivated" } }
    );

    if (authError) {
      console.error("❌ Deactivate auth metadata error:", authError);
      // Profile is already updated so don't fail the request
    }

    console.log(`✅ Admin ${user.email} deactivated user ${targetUserId}`);
    return Response.json({ success: true, message: "User account deactivated" });
  } catch (err) {
    console.error("❌ POST /api/admin/users/[id]/deactivate error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
