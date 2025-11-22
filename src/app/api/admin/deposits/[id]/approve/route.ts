// src/app/api/admin/deposits/[id]/approve/route.ts
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

    const depositId = params.id;

    // Get deposit details
    const [deposit] = await sql<Array<{
      id: string;
      user_id: string;
      plan_id: string;
      amount: string;
    }>>`
      SELECT * FROM deposits WHERE id = ${depositId}
    `;

    if (!deposit) {
      return Response.json({ error: "Deposit not found" }, { status: 404 });
    }

    // Update deposit status
    await sql`
      UPDATE deposits
      SET status = 'confirmed', confirmed_by = ${admin.id}, confirmed_at = NOW()
      WHERE id = ${depositId}
    `;

    // Get plan details
    const [plan] = await sql<Array<{
      id: string;
      duration_days: number;
      total_roi: string;
      referral_bonus_percent: string;
    }>>`
      SELECT * FROM investment_plans WHERE id = ${deposit.plan_id}
    `;

    // Create active investment
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const expectedReturn =
      parseFloat(deposit.amount) * (1 + parseFloat(plan.total_roi) / 100);

    await sql`
      INSERT INTO active_investments (
        user_id, plan_id, deposit_id, principal_amount, 
        current_value, expected_return, start_date, end_date
      )
      VALUES (
        ${deposit.user_id}, ${deposit.plan_id}, ${depositId}, 
        ${deposit.amount}, ${deposit.amount}, ${expectedReturn}, 
        NOW(), ${endDate.toISOString()}
      )
    `;

    // Update user profile
    await sql`
      UPDATE profiles
      SET total_invested = total_invested + ${deposit.amount}
      WHERE id = ${deposit.user_id}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (user_id, type, amount, description, reference_id)
      VALUES (
        ${deposit.user_id}, 'deposit', ${deposit.amount}, 
        'Deposit confirmed', ${depositId}
      )
    `;

    // Check if user was referred and credit referrer
    const [userProfile] = await sql<Array<{ referred_by: string | null }>>`
      SELECT referred_by FROM profiles WHERE id = ${deposit.user_id}
    `;

    if (userProfile?.referred_by) {
      const bonusAmount = parseFloat(deposit.amount) * (parseFloat(plan.referral_bonus_percent) / 100);
      
      // Credit referrer's account
      await sql`
        UPDATE profiles
        SET 
          account_balance = account_balance + ${bonusAmount},
          total_referral_bonus = total_referral_bonus + ${bonusAmount}
        WHERE id = ${userProfile.referred_by}
      `;

      // Create referral record
      await sql`
        INSERT INTO referrals (referrer_id, referred_id, bonus_amount, status)
        VALUES (${userProfile.referred_by}, ${deposit.user_id}, ${bonusAmount}, 'paid')
        ON CONFLICT (referrer_id, referred_id) 
        DO UPDATE SET bonus_amount = referrals.bonus_amount + ${bonusAmount}
      `;

      // Create transaction for referrer
      await sql`
        INSERT INTO transactions (user_id, type, amount, description, reference_id)
        VALUES (
          ${userProfile.referred_by}, 'referral_bonus', ${bonusAmount}, 
          'Referral bonus from deposit', ${depositId}
        )
      `;
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/admin/deposits/[id]/approve error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}