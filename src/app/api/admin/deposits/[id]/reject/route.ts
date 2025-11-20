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

    await sql`
      UPDATE deposits
      SET status = 'rejected', confirmed_by = ${admin.id}, confirmed_at = NOW()
      WHERE id = ${depositId}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/deposits/[id]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



