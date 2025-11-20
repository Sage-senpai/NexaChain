import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all withdrawals (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await sql`
      SELECT role FROM profiles WHERE email = ${session.user.email}
    `;

    if (!profile || profile.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const withdrawals = await sql`
      SELECT * FROM withdrawals
      ORDER BY created_at DESC
    `;

    return Response.json({ withdrawals });
  } catch (err) {
    console.error("GET /api/admin/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



