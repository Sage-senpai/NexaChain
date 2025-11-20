import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's referral history
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await sql`
      SELECT id FROM profiles WHERE email = ${session.user.email}
    `;

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const referrals = await sql`
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



