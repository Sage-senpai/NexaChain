// src/app/api/admin/test-data/route.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { email, scenario } = await request.json();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Create service role client to bypass RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find target user
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get investment plans
    const { data: plans } = await supabaseAdmin
      .from("investment_plans")
      .select("*")
      .order("min_amount", { ascending: true });

    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: "No investment plans found" }, { status: 404 });
    }

    let createdData = {
      deposits: 0,
      investments: 0,
      withdrawals: 0,
      transactions: 0,
      balanceAdded: 0,
    };

    // Scenario 1: New User - 1 pending deposit
    if (scenario === "new_user") {
      const plan = plans[0]; // Basic plan
      const amount = plan.min_amount;

      await supabaseAdmin
        .from("deposits")
        .insert({
          user_id: targetUser.id,
          plan_id: plan.id,
          amount: amount,
          crypto_type: "BTC",
          wallet_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          status: "pending",
          payment_proof: null,
        });

      createdData.deposits = 1;
    }

    // Scenario 2: Active Investor - 2 active investments + some balance
    else if (scenario === "active_investor") {
      const plan1 = plans[0]; // Basic
      const plan2 = plans[1] || plans[0]; // Standard or Basic

      // Create approved deposit 1
      const { data: depositData1, error: depositError1 } = await supabaseAdmin
        .from("deposits")
        .insert({
          user_id: targetUser.id,
          plan_id: plan1.id,
          amount: plan1.min_amount * 2,
          crypto_type: "BTC",
          wallet_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          status: "confirmed",
        })
        .select()
        .single();

      if (depositError1 || !depositData1) {
        console.error("Error creating deposit1:", depositError1);
        return NextResponse.json({ error: "Failed to create deposit1" }, { status: 500 });
      }

      // Create active investment 1
      const startDate1 = new Date();
      startDate1.setDate(startDate1.getDate() - 10); // Started 10 days ago
      const endDate1 = new Date(startDate1);
      endDate1.setDate(endDate1.getDate() + plan1.duration_days);

      const currentValue1 = plan1.min_amount * 2 * 1.15; // 15% gain
      const expectedReturn1 = plan1.min_amount * 2 * (1 + (plan1.total_return / 100));

      const { error: investmentError1 } = await supabaseAdmin.from("active_investments").insert({
        user_id: targetUser.id,
        deposit_id: depositData1.id,
        plan_id: plan1.id,
        principal_amount: plan1.min_amount * 2,
        current_value: currentValue1,
        expected_return: expectedReturn1,
        start_date: startDate1.toISOString(),
        end_date: endDate1.toISOString(),
        status: "active",
      });

      if (investmentError1) {
        console.error("Error creating investment1:", investmentError1);
      }

      // Create approved deposit 2
      const { data: depositData2, error: depositError2 } = await supabaseAdmin
        .from("deposits")
        .insert({
          user_id: targetUser.id,
          plan_id: plan2.id,
          amount: plan2.min_amount,
          crypto_type: "ETH",
          wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          status: "confirmed",
        })
        .select()
        .single();

      if (depositError2 || !depositData2) {
        console.error("Error creating deposit2:", depositError2);
        return NextResponse.json({ error: "Failed to create deposit2" }, { status: 500 });
      }

      // Create active investment 2
      const startDate2 = new Date();
      startDate2.setDate(startDate2.getDate() - 5); // Started 5 days ago
      const endDate2 = new Date(startDate2);
      endDate2.setDate(endDate2.getDate() + plan2.duration_days);

      const currentValue2 = plan2.min_amount * 1.08; // 8% gain
      const expectedReturn2 = plan2.min_amount * (1 + (plan2.total_return / 100));

      const { error: investmentError2 } = await supabaseAdmin.from("active_investments").insert({
        user_id: targetUser.id,
        deposit_id: depositData2.id,
        plan_id: plan2.id,
        principal_amount: plan2.min_amount,
        current_value: currentValue2,
        expected_return: expectedReturn2,
        start_date: startDate2.toISOString(),
        end_date: endDate2.toISOString(),
        status: "active",
      });

      if (investmentError2) {
        console.error("Error creating investment2:", investmentError2);
      }

      // Add balance from ROI
      const balanceToAdd = 500;
      await supabaseAdmin
        .from("profiles")
        .update({
          account_balance: Number(targetUser.account_balance) + balanceToAdd,
          total_invested: Number(targetUser.total_invested || 0) + (plan1.min_amount * 2) + plan2.min_amount,
        })
        .eq("id", targetUser.id);

      // Create transaction for balance
      await supabaseAdmin.from("transactions").insert({
        user_id: targetUser.id,
        type: "credit",
        amount: balanceToAdd,
        description: "ROI Credit - Test Data",
        status: "completed",
      });

      createdData.deposits = 2;
      createdData.investments = 2;
      createdData.transactions = 1;
      createdData.balanceAdded = balanceToAdd;
    }

    // Scenario 3: Experienced Trader - Multiple investments, withdrawals, large balance
    else if (scenario === "experienced_trader") {
      let totalBalance = 0;
      let transactionCount = 0;
      let totalInvested = 0;

      // Create 4 investments across different plans
      for (let i = 0; i < 4; i++) {
        const plan = plans[i % plans.length];
        const multiplier = 1 + i * 0.5; // Increasing amounts
        const amount = plan.min_amount * multiplier;
        totalInvested += amount;

        const { data: depositData, error: depositError } = await supabaseAdmin
          .from("deposits")
          .insert({
            user_id: targetUser.id,
            plan_id: plan.id,
            amount: amount,
            crypto_type: i % 2 === 0 ? "BTC" : "ETH",
            wallet_address: i % 2 === 0 ? "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" : "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
            status: "confirmed",
          })
          .select()
          .single();

        if (depositError || !depositData) {
          console.error(`Error creating deposit ${i}:`, depositError);
          continue;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (20 - i * 3)); // Staggered start dates
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration_days);

        const gainPercent = 0.15 + (i * 0.05); // Increasing gains
        const currentValue = amount * (1 + gainPercent);
        const expectedReturn = amount * (1 + (plan.total_return / 100));

        await supabaseAdmin.from("active_investments").insert({
          user_id: targetUser.id,
          deposit_id: depositData.id,
          plan_id: plan.id,
          principal_amount: amount,
          current_value: currentValue,
          expected_return: expectedReturn,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        });

        // Add ROI to balance
        const roi = currentValue - amount;
        totalBalance += roi;
      }

      // Add extra balance
      totalBalance += 2500;

      await supabaseAdmin
        .from("profiles")
        .update({
          account_balance: Number(targetUser.account_balance) + totalBalance,
          total_invested: Number(targetUser.total_invested || 0) + totalInvested,
        })
        .eq("id", targetUser.id);

      // Create multiple ROI transactions
      for (let i = 0; i < 5; i++) {
        const amount = 300 + i * 150;
        await supabaseAdmin.from("transactions").insert({
          user_id: targetUser.id,
          type: "credit",
          amount: amount,
          description: `ROI Payment ${i + 1} - Test Data`,
          status: "completed",
          created_at: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)).toISOString(),
        });
        transactionCount++;
      }

      // Create 2 completed withdrawals
      for (let i = 0; i < 2; i++) {
        const amount = 500 + i * 300;
        await supabaseAdmin.from("withdrawals").insert({
          user_id: targetUser.id,
          amount: amount,
          crypto_type: "USDT",
          wallet_address: "TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6",
          status: "completed",
          created_at: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)).toISOString(),
        });

        await supabaseAdmin.from("transactions").insert({
          user_id: targetUser.id,
          type: "debit",
          amount: amount,
          description: `Withdrawal ${i + 1} - Test Data`,
          status: "completed",
          created_at: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)).toISOString(),
        });
        transactionCount++;
      }

      // Create 1 pending withdrawal
      await supabaseAdmin.from("withdrawals").insert({
        user_id: targetUser.id,
        amount: 800,
        crypto_type: "BTC",
        wallet_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        status: "pending",
      });

      createdData.deposits = 4;
      createdData.investments = 4;
      createdData.withdrawals = 3;
      createdData.transactions = transactionCount;
      createdData.balanceAdded = totalBalance;
    }

    // Scenario 4: VIP Whale - Large investments, high balance
    else if (scenario === "vip_whale") {
      const vipPlan = plans[plans.length - 1]; // Highest tier plan
      let totalBalance = 0;
      let totalInvested = 0;

      // Create 3 large VIP investments
      for (let i = 0; i < 3; i++) {
        const amount = vipPlan.min_amount * (2 + i);
        totalInvested += amount;

        const { data: depositData, error: depositError } = await supabaseAdmin
          .from("deposits")
          .insert({
            user_id: targetUser.id,
            plan_id: vipPlan.id,
            amount: amount,
            crypto_type: "BTC",
            wallet_address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            status: "confirmed",
          })
          .select()
          .single();

        if (depositError || !depositData) {
          console.error(`Error creating VIP deposit ${i}:`, depositError);
          continue;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (30 - i * 7));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + vipPlan.duration_days);

        const currentValue = amount * 1.35; // 35% gains
        const expectedReturn = amount * (1 + (vipPlan.total_return / 100));

        await supabaseAdmin.from("active_investments").insert({
          user_id: targetUser.id,
          deposit_id: depositData.id,
          plan_id: vipPlan.id,
          principal_amount: amount,
          current_value: currentValue,
          expected_return: expectedReturn,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        });

        totalBalance += currentValue - amount;
      }

      // Add large balance
      totalBalance += 15000;

      await supabaseAdmin
        .from("profiles")
        .update({
          account_balance: Number(targetUser.account_balance) + totalBalance,
          total_invested: Number(targetUser.total_invested || 0) + totalInvested,
        })
        .eq("id", targetUser.id);

      // Create high-value transactions
      for (let i = 0; i < 8; i++) {
        const amount = 1000 + i * 500;
        await supabaseAdmin.from("transactions").insert({
          user_id: targetUser.id,
          type: "credit",
          amount: amount,
          description: `VIP ROI Payment ${i + 1} - Test Data`,
          status: "completed",
          created_at: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)).toISOString(),
        });
      }

      createdData.deposits = 3;
      createdData.investments = 3;
      createdData.transactions = 8;
      createdData.balanceAdded = totalBalance;
    }

    else {
      return NextResponse.json({ error: "Invalid scenario" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test data created for ${email}`,
      data: createdData,
    });
  } catch (error: any) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test data" },
      { status: 500 }
    );
  }
}

// Clear test data for a user
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Create service role client to bypass RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find target user
    const { data: targetUser } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all user data (in correct order due to foreign keys)
    await supabaseAdmin.from("transactions").delete().eq("user_id", targetUser.id);
    await supabaseAdmin.from("active_investments").delete().eq("user_id", targetUser.id);
    await supabaseAdmin.from("withdrawals").delete().eq("user_id", targetUser.id);
    await supabaseAdmin.from("deposits").delete().eq("user_id", targetUser.id);

    // Reset balance
    await supabaseAdmin
      .from("profiles")
      .update({ account_balance: 0, total_invested: 0 })
      .eq("id", targetUser.id);

    return NextResponse.json({
      success: true,
      message: `All test data cleared for ${email}`,
    });
  } catch (error: any) {
    console.error("Error clearing test data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear test data" },
      { status: 500 }
    );
  }
}