// src/app/api/admin/roi/set/route.ts
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
    const { investment_id, new_value } = body;

    if (!investment_id || new_value === undefined || new_value < 0) {
      return Response.json(
        { error: "Missing required fields or invalid value" },
        { status: 400 }
      );
    }

    // Call Supabase function to set ROI
    const { data, error } = await supabase.rpc("admin_set_investment_roi", {
      investment_id: investment_id,
      new_current_value: parseFloat(new_value),
    });

    if (error) {
      console.error("Set ROI error:", error);
      return Response.json({ error: "Failed to set ROI" }, { status: 500 });
    }

    if (!data.success) {
      return Response.json({ error: data.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: `Investment value set to $${parseFloat(new_value).toFixed(2)}`,
      old_value: data.old_value,
      new_value: data.new_value,
      profit: data.profit,
    });
  } catch (err) {
    console.error("POST /api/admin/roi/set error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}