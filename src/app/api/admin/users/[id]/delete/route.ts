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

    // Verify target user exists
    const { data: targetProfile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, email, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Fetch target profile error:", fetchError);
      return Response.json({ error: `Failed to find user: ${fetchError.message}` }, { status: 500 });
    }

    if (!targetProfile) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Step 1: Null out references from OTHER rows that point to this user.
    // This prevents FK constraint violations when deleting the profile.
    const nullifications: Array<{ label: string; run: () => PromiseLike<{ error: any }> }> = [
      {
        label: "profiles.referred_by",
        run: () => adminClient.from("profiles").update({ referred_by: null }).eq("referred_by", targetUserId),
      },
      {
        label: "deposits.confirmed_by",
        run: () => adminClient.from("deposits").update({ confirmed_by: null }).eq("confirmed_by", targetUserId),
      },
      {
        label: "withdrawals.processed_by",
        run: () => adminClient.from("withdrawals").update({ processed_by: null }).eq("processed_by", targetUserId),
      },
    ];

    for (const { label, run } of nullifications) {
      const { error } = await run();
      // Some tables/columns may not exist — log but don't fail
      if (error && !isMissingColumnOrTable(error)) {
        console.warn(`⚠️ Nullify ${label} warning:`, error.message);
      }
    }

    // Step 2: Delete rows owned by this user, in FK-safe order.
    const ownedDeletions: Array<{ label: string; run: () => PromiseLike<{ error: any }> }> = [
      { label: "transactions", run: () => adminClient.from("transactions").delete().eq("user_id", targetUserId) },
      { label: "messages (sender_id)", run: () => adminClient.from("messages").delete().eq("sender_id", targetUserId) },
      { label: "conversations (user_id)", run: () => adminClient.from("conversations").delete().eq("user_id", targetUserId) },
      { label: "active_investments", run: () => adminClient.from("active_investments").delete().eq("user_id", targetUserId) },
      { label: "deposits", run: () => adminClient.from("deposits").delete().eq("user_id", targetUserId) },
      { label: "withdrawals", run: () => adminClient.from("withdrawals").delete().eq("user_id", targetUserId) },
      { label: "referrals (referrer)", run: () => adminClient.from("referrals").delete().eq("referrer_id", targetUserId) },
      { label: "referrals (referred)", run: () => adminClient.from("referrals").delete().eq("referred_id", targetUserId) },
    ];

    for (const { label, run } of ownedDeletions) {
      const { error } = await run();
      if (error && !isMissingColumnOrTable(error)) {
        console.error(`❌ Delete ${label} failed:`, error.message);
        return Response.json({ error: `Failed to delete ${label}: ${error.message}` }, { status: 500 });
      }
    }

    // Step 3: Delete the profile record
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileError) {
      console.error("❌ Delete profile error:", profileError);
      return Response.json(
        { error: `Failed to delete user profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Step 4: Delete the auth user (must be last)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      console.error("❌ Delete auth user error:", authDeleteError);
      return Response.json(
        { error: `Profile deleted but failed to remove auth account: ${authDeleteError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ Admin ${user.email} permanently deleted user ${targetProfile.email} (${targetUserId})`);
    return Response.json({ success: true, message: "User account permanently deleted" });
  } catch (err) {
    console.error("❌ DELETE /api/admin/users/[id]/delete error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Some tables or columns referenced above may not exist in every deployment
 * (e.g., messages/conversations). Treat those as non-fatal.
 */
function isMissingColumnOrTable(error: any): boolean {
  if (!error) return false;
  const code = error.code;
  const message = (error.message || "").toLowerCase();
  // Postgres error codes: 42P01 = undefined_table, 42703 = undefined_column
  return (
    code === "42P01" ||
    code === "42703" ||
    message.includes("does not exist") ||
    message.includes("not found")
  );
}
