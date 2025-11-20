import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all deposits (admin only)
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

    const deposits = await sql`
      SELECT * FROM deposits
      ORDER BY created_at DESC
    `;

    return Response.json({ deposits });
  } catch (err) {
    console.error("GET /api/admin/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



