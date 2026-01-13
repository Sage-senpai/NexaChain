// src/app/api/profile/route.ts
// ============================================
// FIXED VERSION - Better error handling + admin support
// ============================================
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

interface UpdateProfileData {
  phone?: string | null;
  walletAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  referralCode?: string;
  referredBy?: string | null;
}

// Get user profile
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error in /api/profile:", userError);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching profile for user:", user.email);

    // Fetch profile - this should work with the fixed RLS policies
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Profile fetch error:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        user_id: user.id,
        user_email: user.email
      });

      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') { // Not found
        console.log("Profile not found, creating new profile...");
        
        const generatedReferralCode = `NXC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || "",
            referral_code: generatedReferralCode,
            role: 'user', // Default role
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create profile:", createError);
          return Response.json({ 
            error: "Failed to create profile",
            details: createError.message 
          }, { status: 500 });
        }

        console.log("✅ Profile created successfully");
        return Response.json({ profile: newProfile, user });
      }

      // If it's an RLS error (infinite recursion), return helpful message
      if (profileError.code === '42P17') {
        return Response.json({ 
          error: "Database policy error - Please run the RLS fix SQL",
          details: "Infinite recursion detected in RLS policy. Check server logs for fix."
        }, { status: 500 });
      }

      return Response.json({ 
        error: "Failed to fetch profile",
        details: profileError.message 
      }, { status: 500 });
    }

    console.log("✅ Profile fetched successfully for", user.email, "- Role:", profile.role);
    return Response.json({ profile, user });

  } catch (err) {
    console.error("❌ GET /api/profile critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

// Update or create user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as UpdateProfileData;
    const {
      phone,
      walletAddress,
      city,
      state,
      country,
      referralCode,
      referredBy,
    } = body;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create new profile with generated referral code
      const generatedReferralCode =
        referralCode ||
        `NXC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      let referrerUserId: string | null = null;
      if (referredBy) {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", referredBy)
          .single();
        
        if (referrer) {
          referrerUserId = referrer.id;
        }
      }

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || "",
          phone: phone || null,
          wallet_address: walletAddress || null,
          city: city || null,
          state: state || null,
          country: country || "United Kingdom",
          referral_code: generatedReferralCode,
          referred_by: referrerUserId,
          role: 'user', // Default role
        })
        .select()
        .single();

      if (insertError) {
        console.error("Profile creation error:", insertError);
        return Response.json({ error: "Failed to create profile" }, { status: 500 });
      }

      // If referred, create referral record
      if (referrerUserId) {
        await supabase.from("referrals").insert({
          referrer_id: referrerUserId,
          referred_id: user.id,
        });
      }

      return Response.json({ profile: newProfile });
    } else {
      // Update existing profile
      const updateData: Record<string, string | null> = {};
      
      if (phone !== undefined) updateData.phone = phone;
      if (walletAddress !== undefined) updateData.wallet_address = walletAddress;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (country !== undefined) updateData.country = country;

      if (Object.keys(updateData).length === 0) {
        return Response.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
        return Response.json({ error: "Failed to update profile" }, { status: 500 });
      }

      return Response.json({ profile: updatedProfile });
    }
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}