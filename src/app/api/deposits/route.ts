// src/app/api/deposits/route.ts
import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { Deposit } from "@/types/database.types";

// Get user's deposits
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const deposits = await sql<Deposit[]>`
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
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { plan_id, crypto_type, wallet_address, amount, proof_image_url } = body;

    if (!plan_id || !crypto_type || !wallet_address || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan and amount
    const plan = await sql`
      SELECT * FROM investment_plans WHERE id = ${plan_id} LIMIT 1
    `;
    
    if (plan.length === 0) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planData = plan[0];
    const numAmount = parseFloat(amount);
    
    if (
      numAmount < parseFloat(planData.min_amount) ||
      (planData.max_amount && numAmount > parseFloat(planData.max_amount))
    ) {
      return Response.json(
        {
          error: `Amount must be between $${planData.min_amount} and $${planData.max_amount || "unlimited"}`,
        },
        { status: 400 }
      );
    }

    // Create deposit
    const deposit = await sql`
      INSERT INTO deposits (
        user_id, plan_id, crypto_type, wallet_address, amount, 
        proof_image_url, status, created_at, updated_at
      ) VALUES (
        ${userId}, ${plan_id}, ${crypto_type}, ${wallet_address}, ${numAmount},
        ${proof_image_url || null}, 'pending', NOW(), NOW()
      ) RETURNING *
    `;

    return Response.json({ deposit: deposit[0] });
  } catch (err) {
    console.error("POST /api/deposits error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}