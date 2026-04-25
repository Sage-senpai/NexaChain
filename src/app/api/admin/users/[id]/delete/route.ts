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

    if (targetUserId === user.id) {
      return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify target user exists in profiles
    const { data: targetProfile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, email, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (fetchError) {
      console.error("[delete-user] Fetch profile error:", fetchError);
      return Response.json(
        { error: `Database error: ${fetchError.message}` },
        { status: 500 }
      );
    }

    const diagnostics: string[] = [];
    const log = (msg: string) => {
      console.log("[delete-user]", msg);
      diagnostics.push(msg);
    };

    log(`Target: ${targetProfile?.email ?? targetUserId} (role: ${targetProfile?.role ?? "unknown"})`);

    // ============================================
    // STEP 1: Null out references from OTHER rows
    // ============================================
    const nullifications = [
      { table: "profiles", column: "referred_by" },
      { table: "deposits", column: "confirmed_by" },
      { table: "withdrawals", column: "processed_by" },
    ];

    for (const { table, column } of nullifications) {
      const { error } = await adminClient
        .from(table)
        .update({ [column]: null })
        .eq(column, targetUserId);
      if (error && !isMissingColumnOrTable(error)) {
        log(`WARN: nullify ${table}.${column} → ${error.message}`);
      } else {
        log(`OK: nullified ${table}.${column}`);
      }
    }

    // ============================================
    // STEP 2: Delete owned rows (best-effort, non-fatal per row)
    // ============================================
    const ownedDeletions = [
      { table: "messages", column: "sender_id" },
      { table: "conversations", column: "user_id" },
      { table: "transactions", column: "user_id" },
      { table: "active_investments", column: "user_id" },
      { table: "deposits", column: "user_id" },
      { table: "withdrawals", column: "user_id" },
      { table: "referrals", column: "referrer_id" },
      { table: "referrals", column: "referred_id" },
    ];

    const failedDeletions: string[] = [];
    for (const { table, column } of ownedDeletions) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq(column, targetUserId);
      if (error && !isMissingColumnOrTable(error)) {
        log(`WARN: delete ${table}.${column} → ${error.message}`);
        failedDeletions.push(`${table}.${column}: ${error.message}`);
      } else {
        log(`OK: deleted from ${table} where ${column}=user`);
      }
    }

    // ============================================
    // STEP 3: Delete the auth user.
    // If profiles.id has ON DELETE CASCADE on auth.users(id),
    // this also removes the profile and any other CASCADE'd rows.
    // ============================================
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      log(`ERROR: auth.admin.deleteUser → ${authDeleteError.message}`);
      return Response.json(
        {
          error: `Failed to delete auth account: ${authDeleteError.message}`,
          diagnostics,
          failedDeletions,
        },
        { status: 500 }
      );
    }
    log("OK: auth.admin.deleteUser succeeded");

    // ============================================
    // STEP 4: Verify profile is gone (cascade may have handled it).
    // If still present, delete it explicitly.
    // ============================================
    const { data: stillExists } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .maybeSingle();

    if (stillExists) {
      log("Profile not cascaded; deleting explicitly");
      const { error: profileError } = await adminClient
        .from("profiles")
        .delete()
        .eq("id", targetUserId);

      if (profileError) {
        log(`ERROR: explicit profile delete → ${profileError.message}`);
        return Response.json(
          {
            error: `Auth account removed but profile delete failed: ${profileError.message}`,
            diagnostics,
            failedDeletions,
          },
          { status: 500 }
        );
      }
      log("OK: profile deleted explicitly");
    } else {
      log("Profile auto-cascaded with auth user");
    }

    return Response.json({
      success: true,
      message: "User account permanently deleted",
      diagnostics,
      ...(failedDeletions.length > 0 && { warnings: failedDeletions }),
    });
  } catch (err) {
    console.error("[delete-user] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return Response.json({ error: message }, { status: 500 });
  }
}

function isMissingColumnOrTable(error: any): boolean {
  if (!error) return false;
  const code = error.code;
  const message = (error.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "42703" ||
    message.includes("does not exist") ||
    message.includes("not found") ||
    message.includes("schema cache")
  );
}
