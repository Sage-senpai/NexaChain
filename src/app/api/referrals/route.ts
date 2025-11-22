// src/app/api/referrals/route.ts
// ==========================================
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Referrals fetch error:", error);
      return Response.json({ error: "Failed to fetch referrals" }, { status: 500 });
    }

    return Response.json({ referrals: referrals || [] });
  } catch (err) {
    console.error("GET /api/referrals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}