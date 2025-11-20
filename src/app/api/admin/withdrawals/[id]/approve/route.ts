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

    const withdrawalId = params.id;

    const [withdrawal] = await sql`
      SELECT * FROM withdrawals WHERE id = ${withdrawalId}
    `;

    if (!withdrawal) {
      return Response.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    // Update withdrawal status
    await sql`
      UPDATE withdrawals
      SET status = 'approved', processed_by = ${admin.id}, processed_at = NOW()
      WHERE id = ${withdrawalId}
    `;

    // Deduct from user balance
    await sql`
      UPDATE profiles
      SET 
        account_balance = account_balance - ${withdrawal.amount},
        total_withdrawn = total_withdrawn + ${withdrawal.amount}
      WHERE id = ${withdrawal.user_id}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (user_id, type, amount, description, reference_id)
      VALUES (
        ${withdrawal.user_id}, 'withdrawal', ${withdrawal.amount}, 
        'Withdrawal approved', ${withdrawalId}
      )
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



