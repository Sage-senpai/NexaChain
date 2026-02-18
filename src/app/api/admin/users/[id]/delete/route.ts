// src/app/api/admin/users/[id]/delete/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";

export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (targetUserId === user.id) {
      return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Wipe all related data in order (respecting foreign keys)
    const deletions = [
      adminClient.from("transactions").delete().eq("user_id", targetUserId),
      adminClient.from("active_investments").delete().eq("user_id", targetUserId),
      adminClient.from("deposits").delete().eq("user_id", targetUserId),
      adminClient.from("withdrawals").delete().eq("user_id", targetUserId),
      adminClient.from("referrals").delete().eq("referrer_id", targetUserId),
      adminClient.from("referrals").delete().eq("referred_id", targetUserId),
    ];

    // Delete messages/conversations if tables exist
    try {
      await adminClient.from("messages").delete().eq("sender_id", targetUserId);
      await adminClient.from("conversations").delete().eq("user_id", targetUserId);
    } catch {
      // Tables may have different names — non-fatal
    }

    await Promise.all(deletions);

    // Delete profile record
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileError) {
      console.error("❌ Delete profile error:", profileError);
      return Response.json({ error: "Failed to delete user profile" }, { status: 500 });
    }

    // Delete the auth user (must be last)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      console.error("❌ Delete auth user error:", authDeleteError);
      return Response.json({ error: "Profile deleted but failed to remove auth account" }, { status: 500 });
    }

    console.log(`✅ Admin ${user.email} permanently deleted user ${targetUserId}`);
    return Response.json({ success: true, message: "User account permanently deleted" });
  } catch (err) {
    console.error("❌ DELETE /api/admin/users/[id]/delete error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
