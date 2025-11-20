import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [admin] = await sql`
      SELECT id, role FROM profiles WHERE email = ${session.user.email}
    `;

    if (!admin || admin.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const depositId = params.id;

    // Get deposit details
    const [deposit] = await sql`
      SELECT * FROM deposits WHERE id = ${depositId}
    `;

    if (!deposit) {
      return Response.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Update deposit status
    await sql`
      UPDATE deposits
      SET status = 'confirmed', confirmed_by = ${admin.id}, confirmed_at = NOW()
      WHERE id = ${depositId}
    `;

    // Get plan details
    const [plan] = await sql`
      SELECT * FROM investment_plans WHERE id = ${deposit.plan_id}
    `;

    // Create active investment
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const expectedReturn =
      parseFloat(deposit.amount) * (1 + parseFloat(plan.total_roi) / 100);

    await sql`
      INSERT INTO active_investments (
        user_id, plan_id, deposit_id, principal_amount, 
        current_value, expected_return, start_date, end_date
      )
      VALUES (
        ${deposit.user_id}, ${deposit.plan_id}, ${depositId}, 
        ${deposit.amount}, ${deposit.amount}, ${expectedReturn}, 
        NOW(), ${endDate.toISOString()}
      )
    `;

    // Update user profile
    await sql`
      UPDATE profiles
      SET total_invested = total_invested + ${deposit.amount}
      WHERE id = ${deposit.user_id}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (user_id, type, amount, description, reference_id)
      VALUES (
        ${deposit.user_id}, 'deposit', ${deposit.amount}, 
        'Deposit confirmed', ${depositId}
      )
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/deposits/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



