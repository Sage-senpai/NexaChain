// src/app/api/plans/route.ts
// ==========================================
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: plans, error } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_amount", { ascending: true });

    if (error) {
      console.error("Plans fetch error:", error);
      return Response.json({ error: "Failed to fetch plans" }, { status: 500 });
    }

    return Response.json({ plans: plans || [] });
  } catch (err) {
    console.error("GET /api/plans error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}