// src/app/api/admin/withdrawals/[id]/reject/route.ts
import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [admin] = await sql<Array<{ id: string; role: string }>>`
      SELECT id, role FROM profiles WHERE email = ${session.user.email}
    `;

    if (!admin || admin.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const withdrawalId = params.id;

    await sql`
      UPDATE withdrawals
      SET status = 'rejected', processed_by = ${admin.id}, processed_at = NOW()
      WHERE id = ${withdrawalId}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/withdrawals/[id]/reject error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}