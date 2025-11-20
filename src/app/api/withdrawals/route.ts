import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new withdrawal request
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, crypto_type, wallet_address } = body;

    if (!amount || !crypto_type || !wallet_address) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user's profile and check balance
    const [profile] = await sql`
      SELECT id, account_balance FROM profiles WHERE email = ${session.user.email}
    `;

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const numAmount = parseFloat(amount);
    if (numAmount > parseFloat(profile.account_balance)) {
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (numAmount < 10) {
      return Response.json(
        { error: "Minimum withdrawal is $10" },
        { status: 400 },
      );
    }

    // Create withdrawal request
    const [withdrawal] = await sql`
      INSERT INTO withdrawals (user_id, amount, crypto_type, wallet_address)
      VALUES (${profile.id}, ${numAmount}, ${crypto_type}, ${wallet_address})
      RETURNING *
    `;

    return Response.json({ withdrawal });
  } catch (err) {
    console.error("POST /api/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get user's withdrawal history
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

    const withdrawals = await sql`
      SELECT * FROM withdrawals
      WHERE user_id = ${profile.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ withdrawals });
  } catch (err) {
    console.error("GET /api/withdrawals error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



