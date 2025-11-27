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

    if (!user_id || amount === undefined || amount === 0) {
      return Response.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    // Call Supabase function to adjust balance
    const { data, error } = await supabase.rpc("admin_adjust_balance", {
      target_user_id: user_id,
      adjustment_amount: parseFloat(amount),
      description: description || null,
    });

    if (error) {
      console.error("Adjust balance error:", error);
      return Response.json({ error: "Failed to adjust balance" }, { status: 500 });
    }

    if (!data.success) {
      return Response.json({ error: data.message }, { status: 400 });
    }

    const action = parseFloat(amount) > 0 ? "added" : "deducted";
    return Response.json({
      success: true,
      message: `$${Math.abs(parseFloat(amount)).toFixed(2)} ${action} successfully`,
      old_balance: data.old_balance,
      new_balance: data.new_balance,
      adjustment: data.adjustment,
    });
  } catch (err) {
    console.error("POST /api/admin/balance/adjust error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}