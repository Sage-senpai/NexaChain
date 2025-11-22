// src/app/api/admin/withdrawals/[id]/reject/route.ts
// ==========================================
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: withdrawalId } = await params;

    await supabase
      .from("withdrawals")
      .update({
        status: "rejected",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}