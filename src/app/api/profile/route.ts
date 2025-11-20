import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get profile from profiles table
    const profiles = await sql`
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
export async function PUT(request) {
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
    const existing =
      await sql`SELECT id FROM profiles WHERE id = ${userId} LIMIT 1`;

    if (existing.length === 0) {
      // Create new profile with generated referral code
      const generatedReferralCode =
        referralCode ||
        `NXC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      let referrerUserId = null;
      if (referredBy) {
        // Look up the referrer by their referral code
        const referrer =
          await sql`SELECT id FROM profiles WHERE referral_code = ${referredBy} LIMIT 1`;
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
      // Update existing profile
      const setClauses = [];
      const values = [];
      let paramCount = 1;

      if (phone !== undefined) {
        setClauses.push(`phone = $${paramCount}`);
        values.push(phone);
        paramCount++;
      }
      if (walletAddress !== undefined) {
        setClauses.push(`wallet_address = $${paramCount}`);
        values.push(walletAddress);
        paramCount++;
      }
      if (city !== undefined) {
        setClauses.push(`city = $${paramCount}`);
        values.push(city);
        paramCount++;
      }
      if (state !== undefined) {
        setClauses.push(`state = $${paramCount}`);
        values.push(state);
        paramCount++;
      }
      if (country !== undefined) {
        setClauses.push(`country = $${paramCount}`);
        values.push(country);
        paramCount++;
      }

      if (setClauses.length === 0) {
        return Response.json(
          { error: "No valid fields to update" },
          { status: 400 },
        );
      }

      setClauses.push(`updated_at = NOW()`);
      const finalQuery = `UPDATE profiles SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
      values.push(userId);

      const result = await sql(finalQuery, values);
      const updated = result?.[0] || null;

      return Response.json({ profile: updated });
    }
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



