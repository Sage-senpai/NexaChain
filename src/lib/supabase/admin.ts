// FILE 1: src/lib/supabase/admin.ts (NEW FILE)
// ============================================
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client that bypasses Row Level Security
 * ⚠️ ONLY USE IN ADMIN API ROUTES AFTER VERIFYING USER ROLE
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verifies if a user is an admin
 * Use this BEFORE using createAdminClient()
 */
export async function verifyAdminAccess(userId: string) {
  const adminClient = createAdminClient();
  
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile || profile.role !== "admin") {
    return false;
  }

  return true;
}
