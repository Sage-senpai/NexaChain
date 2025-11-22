// ============================================
// src/app/api/referrals/route.ts
import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { Referral } from "@/types/database.types";

// Get user's referral history
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await sql<Array<{ id: string }>>`
      SELECT id FROM profiles WHERE id = ${session.user.id}
    `;

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const referrals = await sql<Referral[]>`
      SELECT * FROM referrals
      WHERE referrer_id = ${profile.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ referrals });
  } catch (err) {
    console.error("GET /api/referrals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}