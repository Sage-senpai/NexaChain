// src/app/api/debug/deposits/route.ts
// CREATE THIS FILE TO TEST YOUR SETUP
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: []
  };

  try {
    // Check 1: Environment variables
    diagnostics.checks.env = {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      app_url: process.env.NEXT_PUBLIC_APP_URL || "NOT SET"
    };

    // Check 2: Supabase client creation
    try {
      const supabase = await createClient();
      diagnostics.checks.client_created = true;

      // Check 3: Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        diagnostics.checks.auth = {
          success: false,
          error: authError.message
        };
        diagnostics.errors.push(`Auth error: ${authError.message}`);
      } else if (!user) {
        diagnostics.checks.auth = {
          success: false,
          error: "No user logged in"
        };
      } else {
        diagnostics.checks.auth = {
          success: true,
          user_id: user.id,
          email: user.email
        };

        // Check 4: Profile access
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, email, role")
            .eq("id", user.id)
            .single();

          if (profileError) {
            diagnostics.checks.profile = {
              success: false,
              error: profileError.message,
              code: profileError.code
            };
            diagnostics.errors.push(`Profile error: ${profileError.message}`);
          } else {
            diagnostics.checks.profile = {
              success: true,
              role: profile?.role
            };
          }
        } catch (profileErr: any) {
          diagnostics.checks.profile = {
            success: false,
            error: profileErr.message
          };
          diagnostics.errors.push(`Profile exception: ${profileErr.message}`);
        }

        // Check 5: Can read investment plans?
        try {
          const { data: plans, error: plansError } = await supabase
            .from("investment_plans")
            .select("id, name")
            .limit(1);

          if (plansError) {
            diagnostics.checks.plans = {
              success: false,
              error: plansError.message,
              code: plansError.code
            };
            diagnostics.errors.push(`Plans error: ${plansError.message}`);
          } else {
            diagnostics.checks.plans = {
              success: true,
              count: plans?.length || 0
            };
          }
        } catch (plansErr: any) {
          diagnostics.checks.plans = {
            success: false,
            error: plansErr.message
          };
          diagnostics.errors.push(`Plans exception: ${plansErr.message}`);
        }

        // Check 6: Can read own deposits?
        try {
          const { data: deposits, error: depositsError } = await supabase
            .from("deposits")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          if (depositsError) {
            diagnostics.checks.read_deposits = {
              success: false,
              error: depositsError.message,
              code: depositsError.code
            };
            diagnostics.errors.push(`Read deposits error: ${depositsError.message}`);
          } else {
            diagnostics.checks.read_deposits = {
              success: true,
              count: deposits?.length || 0
            };
          }
        } catch (depositErr: any) {
          diagnostics.checks.read_deposits = {
            success: false,
            error: depositErr.message
          };
          diagnostics.errors.push(`Read deposits exception: ${depositErr.message}`);
        }

        // Check 7: Test INSERT (this is the critical one)
        try {
          // Get a real plan ID first
          const { data: testPlan } = await supabase
            .from("investment_plans")
            .select("id")
            .limit(1)
            .single();

          if (testPlan) {
            const testDeposit = {
              user_id: user.id,
              plan_id: testPlan.id,
              crypto_type: "BTC",
              wallet_address: "TEST_WALLET_ADDRESS",
              amount: 100,
              status: "pending",
              proof_image_url: null
            };

            const { data: insertResult, error: insertError } = await supabase
              .from("deposits")
              .insert(testDeposit)
              .select()
              .single();

            if (insertError) {
              diagnostics.checks.insert_deposit = {
                success: false,
                error: insertError.message,
                code: insertError.code,
                details: insertError.details,
                hint: insertError.hint
              };
              diagnostics.errors.push(`INSERT error: ${insertError.message}`);
            } else {
              diagnostics.checks.insert_deposit = {
                success: true,
                deposit_id: insertResult?.id
              };

              // Clean up test deposit
              await supabase
                .from("deposits")
                .delete()
                .eq("id", insertResult.id);
            }
          }
        } catch (insertErr: any) {
          diagnostics.checks.insert_deposit = {
            success: false,
            error: insertErr.message,
            stack: insertErr.stack
          };
          diagnostics.errors.push(`INSERT exception: ${insertErr.message}`);
        }
      }
    } catch (clientErr: any) {
      diagnostics.checks.client_created = false;
      diagnostics.errors.push(`Client creation error: ${clientErr.message}`);
    }

    // Summary
    diagnostics.summary = {
      total_checks: Object.keys(diagnostics.checks).length,
      total_errors: diagnostics.errors.length,
      status: diagnostics.errors.length === 0 ? "ALL GOOD ✅" : "ISSUES FOUND ❌"
    };

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      error: "Diagnostic failed",
      message: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Test actual deposit creation with real data
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Not authenticated",
        details: authError?.message 
      }, { status: 401 });
    }

    // Attempt to create deposit
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        plan_id: body.plan_id,
        crypto_type: body.crypto_type,
        wallet_address: body.wallet_address,
        amount: parseFloat(body.amount),
        status: "pending",
        proof_image_url: body.proof_image_base64 ? "email_attached" : null
      })
      .select()
      .single();

    if (depositError) {
      return NextResponse.json({
        success: false,
        error: depositError.message,
        code: depositError.code,
        details: depositError.details,
        hint: depositError.hint
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deposit
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}