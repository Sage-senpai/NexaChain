// FILE 6: src/app/api/admin/balance/adjust/route.ts
// ============================================
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdminAccess(user.id);
    
    if (!isAdmin) {
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

    const adminClient = createAdminClient();
    const adjustAmount = parseFloat(amount);

    // Get current balance
    const { data: targetUser, error: userError2 } = await adminClient
      .from("profiles")
      .select("account_balance, email")
      .eq("id", user_id)
      .single();

    if (userError2 || !targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const oldBalance = parseFloat(targetUser.account_balance.toString());
    const newBalance = oldBalance + adjustAmount;

    if (newBalance < 0) {
      return Response.json({ 
        error: "Insufficient balance. Cannot deduct more than available balance." 
      }, { status: 400 });
    }

    // Update balance
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ account_balance: newBalance })
      .eq("id", user_id);

    if (updateError) {
      console.error("Balance adjustment error:", updateError);
      return Response.json({ error: "Failed to adjust balance" }, { status: 500 });
    }

    // Create transaction record
    const action = adjustAmount > 0 ? "added" : "deducted";
    await adminClient.from("transactions").insert({
      user_id: user_id,
      type: "admin_adjustment",
      amount: adjustAmount,
      description: description || `Admin ${action} $${Math.abs(adjustAmount).toFixed(2)}`,
      status: "completed",
    });

    console.log(`✅ Admin ${user.email} adjusted ${targetUser.email} balance: $${oldBalance} → $${newBalance}`);

    return Response.json({
      success: true,
      message: `$${Math.abs(adjustAmount).toFixed(2)} ${action} successfully`,
      old_balance: oldBalance,
      new_balance: newBalance,
      adjustment: adjustAmount,
    });
  } catch (err) {
    console.error("POST /api/admin/balance/adjust error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
