// src/app/api/profile/route.ts
import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

// Get user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get profile from profiles table
    const profiles = await sql<Array<{
      id: string;
      email: string;
      full_name: string | null;
      phone: string | null;
      wallet_address: string | null;
      city: string | null;
      state: string | null;
      country: string;
      account_balance: string;
      total_invested: string;
      total_withdrawn: string;
      total_referral_bonus: string;
      referral_code: string;
      referred_by: string | null;
      role: string;
      created_at: string;
      updated_at: string;
    }>>`
      SELECT * FROM profiles WHERE id = ${userId} LIMIT 1
    `;

    const profile = profiles?.[0] || null;

    return Response.json({ profile, user: session.user });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update or create user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      phone,
      walletAddress,
      city,
      state,
      country,
      referralCode,
      referredBy,
    } = body || {};

    // Check if profile exists
    const existing = await sql<Array<{ id: string }>>`
      SELECT id FROM profiles WHERE id = ${userId} LIMIT 1
    `;

    if (existing.length === 0) {
      // Create new profile with generated referral code
      const generatedReferralCode =
        referralCode ||
        `NXC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      let referrerUserId: string | null = null;
      if (referredBy) {
        // Look up the referrer by their referral code
        const referrer = await sql<Array<{ id: string }>>`
          SELECT id FROM profiles WHERE referral_code = ${referredBy} LIMIT 1
        `;
        if (referrer.length > 0) {
          referrerUserId = referrer[0].id;
        }
      }

      const newProfile = await sql`
        INSERT INTO profiles (
          id, email, full_name, phone, wallet_address, city, state, country, 
          referral_code, referred_by, created_at, updated_at
        ) VALUES (
          ${userId}, ${session.user.email}, ${session.user.name || ""}, 
          ${phone || null}, ${walletAddress || null}, ${city || null}, 
          ${state || null}, ${country || "Nigeria"}, ${generatedReferralCode}, 
          ${referrerUserId}, NOW(), NOW()
        ) RETURNING *
      `;

      // If referred, create referral record
      if (referrerUserId) {
        await sql`
          INSERT INTO referrals (referrer_id, referred_id, created_at)
          VALUES (${referrerUserId}, ${userId}, NOW())
        `;
      }

      return Response.json({ profile: newProfile[0] });
    } else {
      // Update existing profile - build dynamic query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        values.push(phone);
        paramIndex++;
      }
      if (walletAddress !== undefined) {
        updates.push(`wallet_address = $${paramIndex}`);
        values.push(walletAddress);
        paramIndex++;
      }
      if (city !== undefined) {
        updates.push(`city = $${paramIndex}`);
        values.push(city);
        paramIndex++;
      }
      if (state !== undefined) {
        updates.push(`state = $${paramIndex}`);
        values.push(state);
        paramIndex++;
      }
      if (country !== undefined) {
        updates.push(`country = $${paramIndex}`);
        values.push(country);
        paramIndex++;
      }

      if (updates.length === 0) {
        return Response.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      updates.push(`updated_at = NOW()`);
      const query = `UPDATE profiles SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      values.push(userId);

      const result = await sql(query, values);
      const updated = result?.[0] || null;

      return Response.json({ profile: updated });
    }
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
