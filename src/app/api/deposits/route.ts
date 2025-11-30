// src/app/api/deposits/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, crypto_type, wallet_address, amount, proof_image_base64 } = body;

    // Validate required fields
    if (!plan_id || !crypto_type || !wallet_address || !amount) {
      console.error("Missing required fields");
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan and amount
    const { data: plan, error: planError } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("id", plan_id)
      .single();
    
    if (planError || !plan) {
      console.error("Plan error:", planError);
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    
    if (
      numAmount < parseFloat(plan.min_amount) ||
      (plan.max_amount && numAmount > parseFloat(plan.max_amount))
    ) {
      return Response.json(
        {
          error: `Amount must be between $${plan.min_amount} and $${plan.max_amount || "unlimited"}`,
        },
        { status: 400 }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Create deposit (PRIMARY OPERATION - must succeed)
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        plan_id: plan_id,
        crypto_type: crypto_type,
        wallet_address: wallet_address,
        amount: numAmount,
        proof_image_url: proof_image_base64 ? "email_attached" : null,
        status: "pending",
      })
      .select()
      .single();

    if (depositError) {
      console.error("Deposit creation error:", depositError);
      return Response.json({ error: "Failed to create deposit" }, { status: 500 });
    }

    // ✅ DEPOSIT CREATED SUCCESSFULLY - Now try email as non-blocking operation
    
    // Get all admin emails
    const { data: admins } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("role", "admin");

    // Send email notification (DON'T BLOCK on email failure)
    if (admins && admins.length > 0 && proof_image_base64 && process.env.RESEND_API_KEY) {
      try {
        // Use Promise.resolve().then() to make this non-blocking
        Promise.resolve().then(async () => {
          try {
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-deposit-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                admins: admins,
                deposit: {
                  id: deposit.id,
                  amount: numAmount,
                  crypto_type: crypto_type,
                  plan_name: plan.name,
                  plan_emoji: plan.emoji,
                  user_name: profile?.full_name || profile?.email || "Unknown User",
                  user_email: profile?.email || user.email,
                  created_at: deposit.created_at,
                },
                proof_image: proof_image_base64,
              }),
            });
            
            if (!emailResponse.ok) {
              console.warn("Email notification failed:", await emailResponse.text());
            }
          } catch (emailError) {
            console.warn("Email notification error (non-critical):", emailError);
          }
        });
      } catch (err) {
        console.warn("Failed to initiate email send (non-critical):", err);
      }
    } else {
      console.log("Email not sent:", { 
        hasAdmins: admins && admins.length > 0, 
        hasProof: !!proof_image_base64,
        hasResendKey: !!process.env.RESEND_API_KEY 
      });
    }

    // ✅ Return success immediately (don't wait for email)
    return Response.json({ deposit });
    
  } catch (err) {
    console.error("POST /api/deposits critical error:", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}