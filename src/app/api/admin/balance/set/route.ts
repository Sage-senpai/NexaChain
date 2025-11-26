// FILE 1: src/app/api/admin/balance/set/route.ts
// ============================================
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, amount, description } = body;

    if (!user_id || amount === undefined || amount < 0) {
      return Response.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    // Call Supabase function to set balance
    const { data, error } = await supabase.rpc("admin_set_balance", {
      target_user_id: user_id,
      new_balance: parseFloat(amount),
    });

    if (error) {
      console.error("Set balance error:", error);
      return Response.json({ error: "Failed to set balance" }, { status: 500 });
    }

    if (!data.success) {
      return Response.json({ error: data.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: `Balance set to $${parseFloat(amount).toFixed(2)}`,
      old_balance: data.old_balance,
      new_balance: data.new_balance,
    });
  } catch (err) {
    console.error("POST /api/admin/balance/set error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
