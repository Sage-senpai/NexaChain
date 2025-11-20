import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's active investments
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const investments = await sql`
      SELECT i.*, p.name as plan_name, p.emoji as plan_emoji, 
             p.daily_roi, p.duration_days
      FROM active_investments i
      LEFT JOIN investment_plans p ON i.plan_id = p.id
      WHERE i.user_id = ${userId} AND i.status = 'active'
      ORDER BY i.created_at DESC
    `;

    return Response.json({ investments });
  } catch (err) {
    console.error("GET /api/investments error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



