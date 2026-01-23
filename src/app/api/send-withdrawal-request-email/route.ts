// src/app/api/send-withdrawal-request-email/route.ts
// Sends email notifications to ALL ADMINS when a user requests a withdrawal
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";

interface AdminInfo {
  email: string;
  full_name: string | null;
}

interface WithdrawalRequestData {
  admins: AdminInfo[];
  withdrawal: {
    id: string;
    amount: number;
    crypto_type: string;
    wallet_address: string;
    created_at: string;
    user_name: string;
    user_email: string;
    user_balance: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalRequestData = await request.json();
    const { admins, withdrawal } = body;

    if (!admins || admins.length === 0) {
      return Response.json({
        error: "No admin emails found"
      }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const emailPromises = admins.map(async (admin: AdminInfo) => {
      const emailHTML = generateWithdrawalRequestEmailHTML({
        admin_name: admin.full_name || 'Admin',
        user_name: withdrawal.user_name,
        user_email: withdrawal.user_email,
        amount: withdrawal.amount,
        crypto_type: withdrawal.crypto_type,
        wallet_address: withdrawal.wallet_address,
        user_balance: withdrawal.user_balance,
        withdrawal_id: withdrawal.id,
        created_at: withdrawal.created_at,
        appUrl,
      });

      console.log(`📧 [WITHDRAWAL REQUEST] Attempting to send to admin: ${admin.email}`);

      const subject = `💸 New Withdrawal Request: $${parseFloat(withdrawal.amount.toString()).toFixed(2)} from ${withdrawal.user_name}`;
      const result = await sendEmail({
        to: admin.email,
        subject,
        html: emailHTML,
      });

      if (!result.success) {
        console.error(`❌ [WITHDRAWAL REQUEST] Failed for ${admin.email}:`, result.error);
        return { success: false, email: admin.email, error: result.error };
      }

      console.log(`✅ [WITHDRAWAL REQUEST] Email sent to ${admin.email}`);
      return { success: true, email: admin.email };
    });

    const results = await Promise.all(emailPromises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount > 0) {
      console.error(`Withdrawal request email sending completed with ${failureCount} failures`);
    }

    return Response.json({
      success: true,
      message: `Withdrawal request emails sent to ${successCount}/${admins.length} admin(s)`,
      results: results
    });
  } catch (err) {
    console.error("Send withdrawal request email error:", err);
    return Response.json({
      error: "Failed to send withdrawal request emails",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

function generateWithdrawalRequestEmailHTML({
  admin_name,
  user_name,
  user_email,
  amount,
  crypto_type,
  wallet_address,
  user_balance,
  withdrawal_id,
  created_at,
  appUrl,
}: {
  admin_name: string;
  user_name: string;
  user_email: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  user_balance: number;
  withdrawal_id: string;
  created_at: string;
  appUrl: string;
}) {
  const formattedAmount = parseFloat(amount.toString()).toFixed(2);
  const formattedBalance = parseFloat(user_balance.toString()).toFixed(2);
  const balanceAfter = (parseFloat(user_balance.toString()) - parseFloat(amount.toString())).toFixed(2);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background-color: #F8F9FA;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header .icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px;
        }
        .amount-box {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
          border: 3px solid #D4AF37;
        }
        .amount-box .amount {
          font-size: 42px;
          font-weight: 700;
          color: #D4AF37;
          margin: 10px 0;
        }
        .amount-box .label {
          font-size: 14px;
          color: #92400E;
          font-weight: 600;
        }
        .info-box {
          background-color: #F8F9FA;
          border-left: 4px solid #8B5CF6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #4A4A4A;
        }
        .value {
          color: #000000;
          font-weight: 500;
          word-break: break-all;
        }
        .wallet-box {
          background-color: #F3F4F6;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .wallet-box .label {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 8px;
          display: block;
        }
        .wallet-address {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 12px;
          background-color: #1F2937;
          color: #10B981;
          padding: 12px;
          border-radius: 6px;
          word-break: break-all;
        }
        .balance-info {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 20px 0;
        }
        .balance-card {
          flex: 1;
          background-color: #F8F9FA;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          border: 1px solid #E5E7EB;
        }
        .balance-card .amount {
          font-size: 24px;
          font-weight: 700;
          margin: 5px 0;
        }
        .balance-card .label {
          font-size: 12px;
          color: #6B7280;
        }
        .balance-card.current .amount {
          color: #3B82F6;
        }
        .balance-card.after .amount {
          color: #10B981;
        }
        .alert-box {
          background-color: #FEF3C7;
          border: 2px solid #F59E0B;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400E;
        }
        .alert-box strong {
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .footer {
          background-color: #1A1A1A;
          color: #B8B8B8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">💸</div>
          <h1>New Withdrawal Request</h1>
        </div>

        <div class="content">
          <p style="font-size: 16px; color: #000000; margin-bottom: 10px;">
            Hello <strong>${admin_name}</strong>,
          </p>

          <p style="color: #4A4A4A; margin-bottom: 25px;">
            A user has submitted a withdrawal request that requires your review:
          </p>

          <div class="amount-box">
            <div class="label">WITHDRAWAL AMOUNT</div>
            <div class="amount">$${formattedAmount}</div>
            <div class="label">${crypto_type}</div>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="label">👤 User:</span>
              <span class="value">${user_name}</span>
            </div>
            <div class="info-row">
              <span class="label">📧 Email:</span>
              <span class="value">${user_email}</span>
            </div>
            <div class="info-row">
              <span class="label">🪙 Crypto:</span>
              <span class="value">${crypto_type}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 Requested:</span>
              <span class="value">${new Date(created_at).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">🆔 Reference:</span>
              <span class="value">${withdrawal_id.substring(0, 8)}...</span>
            </div>
          </div>

          <div class="wallet-box">
            <span class="label">📬 DESTINATION WALLET ADDRESS</span>
            <div class="wallet-address">${wallet_address}</div>
          </div>

          <div class="balance-info">
            <div class="balance-card current">
              <div class="label">Current Balance</div>
              <div class="amount">$${formattedBalance}</div>
            </div>
            <div class="balance-card after">
              <div class="label">After Withdrawal</div>
              <div class="amount">$${balanceAfter}</div>
            </div>
          </div>

          <div class="alert-box">
            <strong>⚠️ Action Required:</strong>
            <p style="margin: 0; line-height: 1.6;">
              Please review this withdrawal request in your admin dashboard.
              Verify the wallet address is correct before approving.
              Once approved, the amount will be deducted from the user's balance and you must send the crypto manually.
            </p>
          </div>

          <div style="text-align: center; margin-top: 35px;">
            <a href="${appUrl}/admin" class="button">
              Review in Admin Panel →
            </a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Nexachain Investment Platform</strong></p>
          <p>Premium Cryptocurrency Investment</p>
          <p style="margin-top: 10px;">This is an automated notification. Do not reply to this email.</p>
          <p style="color: #6B7280; margin-top: 10px;">© 2025 Nexachain. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
