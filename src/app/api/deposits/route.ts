import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's deposits
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const deposits = await sql`
      SELECT d.*, p.name as plan_name, p.emoji as plan_emoji
      FROM deposits d
      LEFT JOIN investment_plans p ON d.plan_id = p.id
      WHERE d.user_id = ${userId}
      ORDER BY d.created_at DESC
    `;

    return Response.json({ deposits });
  } catch (err) {
    console.error("GET /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new deposit
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { planId, cryptoType, walletAddress, amount, proofImageUrl } = body;

    if (!planId || !cryptoType || !walletAddress || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate plan and amount
    const plan =
      await sql`SELECT * FROM investment_plans WHERE id = ${planId} LIMIT 1`;
    if (plan.length === 0) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planData = plan[0];
    if (
      amount < planData.min_amount ||
      (planData.max_amount && amount > planData.max_amount)
    ) {
      return Response.json(
        {
          error: `Amount must be between $${planData.min_amount} and $${planData.max_amount || "unlimited"}`,
        },
        { status: 400 },
      );
    }

    // Create deposit
    const deposit = await sql`
      INSERT INTO deposits (
        user_id, plan_id, crypto_type, wallet_address, amount, 
        proof_image_url, status, created_at, updated_at
      ) VALUES (
        ${userId}, ${planId}, ${cryptoType}, ${walletAddress}, ${amount},
        ${proofImageUrl || null}, 'pending', NOW(), NOW()
      ) RETURNING *
    `;

    return Response.json({ deposit: deposit[0] });
  } catch (err) {
    console.error("POST /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



