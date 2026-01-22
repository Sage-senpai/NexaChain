// src/app/api/send-withdrawal-email/route.ts
// Sends email notifications to users when their withdrawal is approved or rejected
import { NextRequest } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WithdrawalEmailData {
  user_email: string;
  user_name: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  withdrawal_id: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalEmailData = await request.json();
    const {
      user_email,
      user_name,
      amount,
      crypto_type,
      wallet_address,
      withdrawal_id,
      status,
      rejection_reason,
      created_at
    } = body;

    if (!user_email) {
      return Response.json({
        error: "User email is required"
      }, { status: 400 });
    }

    const isApproved = status === 'approved';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const emailHTML = isApproved
      ? generateApprovedEmailHTML({ user_name, amount, crypto_type, wallet_address, withdrawal_id, created_at, appUrl })
      : generateRejectedEmailHTML({ user_name, amount, crypto_type, wallet_address, withdrawal_id, rejection_reason, created_at, appUrl });

    const subject = isApproved
      ? `✅ Withdrawal Approved - $${parseFloat(amount.toString()).toFixed(2)}`
      : `❌ Withdrawal Rejected - $${parseFloat(amount.toString()).toFixed(2)}`;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Nexachain <onboarding@resend.dev>',
        to: user_email,
        subject: subject,
        html: emailHTML,
      });

      if (error) {
        console.error(`Failed to send withdrawal email to ${user_email}:`, error);
        return Response.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      console.log(`✅ Withdrawal ${status} email sent to ${user_email}`);
      return Response.json({
        success: true,
        message: `Withdrawal ${status} email sent successfully`,
        data
      });
    } catch (error) {
      console.error(`Error sending withdrawal email to ${user_email}:`, error);
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email"
      }, { status: 500 });
    }
  } catch (err) {
    console.error("Send withdrawal email error:", err);
    return Response.json({
      error: "Failed to send withdrawal email",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

function generateApprovedEmailHTML({
  user_name,
  amount,
  crypto_type,
  wallet_address,
  withdrawal_id,
  created_at,
  appUrl
}: {
  user_name: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  withdrawal_id: string;
  created_at: string;
  appUrl: string;
}) {
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
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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
        .success-box {
          background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
          border: 2px solid #10B981;
        }
        .success-box .amount {
          font-size: 42px;
          font-weight: 700;
          color: #059669;
          margin: 10px 0;
        }
        .success-box .status {
          font-size: 18px;
          font-weight: 600;
          color: #047857;
        }
        .info-box {
          background-color: #F8F9FA;
          border-left: 4px solid #D4AF37;
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
        .wallet-address {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 12px;
          background-color: #F3F4F6;
          padding: 8px;
          border-radius: 6px;
          margin-top: 5px;
          word-break: break-all;
        }
        .notice-box {
          background-color: #FEF3C7;
          border: 2px solid #F59E0B;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400E;
        }
        .notice-box strong {
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
          <div class="icon">✅</div>
          <h1>Withdrawal Approved!</h1>
        </div>

        <div class="content">
          <p style="font-size: 16px; color: #000000; margin-bottom: 10px;">
            Hello <strong>${user_name || 'Valued Investor'}</strong>,
          </p>

          <p style="color: #4A4A4A; margin-bottom: 25px;">
            Great news! Your withdrawal request has been <strong style="color: #10B981;">approved</strong> and is being processed.
          </p>

          <div class="success-box">
            <div class="status">💸 Withdrawal Approved</div>
            <div class="amount">$${parseFloat(amount.toString()).toFixed(2)}</div>
            <p style="margin: 0; color: #047857; font-size: 14px;">Payment is being sent to your wallet</p>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="label">💰 Amount:</span>
              <span class="value">$${parseFloat(amount.toString()).toFixed(2)}</span>
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

          <div style="margin: 20px 0;">
            <p style="color: #4A4A4A; margin-bottom: 10px;"><strong>📬 Destination Wallet:</strong></p>
            <div class="wallet-address">${wallet_address}</div>
          </div>

          <div class="notice-box">
            <strong>⏳ Important Notice:</strong>
            <p style="margin: 0; line-height: 1.6;">
              Your funds are being sent to your wallet. Please allow up to <strong>24 hours</strong> for the transaction to appear on the blockchain.
              Check your wallet for transaction confirmation. If you don't see it within 24 hours, please contact support.
            </p>
          </div>

          <div style="text-align: center; margin-top: 35px;">
            <a href="${appUrl}/dashboard" class="button">
              View Your Dashboard →
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

function generateRejectedEmailHTML({
  user_name,
  amount,
  crypto_type,
  wallet_address,
  withdrawal_id,
  rejection_reason,
  created_at,
  appUrl
}: {
  user_name: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  withdrawal_id: string;
  rejection_reason?: string;
  created_at: string;
  appUrl: string;
}) {
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
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
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
        .rejected-box {
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
          border: 2px solid #EF4444;
        }
        .rejected-box .amount {
          font-size: 42px;
          font-weight: 700;
          color: #DC2626;
          margin: 10px 0;
          text-decoration: line-through;
        }
        .rejected-box .status {
          font-size: 18px;
          font-weight: 600;
          color: #B91C1C;
        }
        .reason-box {
          background-color: #FEF2F2;
          border: 2px solid #EF4444;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .reason-box strong {
          display: block;
          margin-bottom: 10px;
          font-size: 16px;
          color: #B91C1C;
        }
        .reason-box p {
          margin: 0;
          color: #7F1D1D;
          font-size: 15px;
          line-height: 1.6;
        }
        .info-box {
          background-color: #F8F9FA;
          border-left: 4px solid #9CA3AF;
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
          color: #6B7280;
          font-weight: 500;
        }
        .balance-notice {
          background-color: #DBEAFE;
          border: 2px solid #3B82F6;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #1E40AF;
        }
        .balance-notice strong {
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
        .support-link {
          color: #D4AF37;
          text-decoration: none;
          font-weight: 600;
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
          <div class="icon">❌</div>
          <h1>Withdrawal Rejected</h1>
        </div>

        <div class="content">
          <p style="font-size: 16px; color: #000000; margin-bottom: 10px;">
            Hello <strong>${user_name || 'Valued Investor'}</strong>,
          </p>

          <p style="color: #4A4A4A; margin-bottom: 25px;">
            We regret to inform you that your withdrawal request has been <strong style="color: #EF4444;">rejected</strong>.
          </p>

          <div class="rejected-box">
            <div class="status">🚫 Withdrawal Rejected</div>
            <div class="amount">$${parseFloat(amount.toString()).toFixed(2)}</div>
            <p style="margin: 0; color: #B91C1C; font-size: 14px;">This request could not be processed</p>
          </div>

          ${rejection_reason ? `
          <div class="reason-box">
            <strong>📋 Reason for Rejection:</strong>
            <p>${rejection_reason}</p>
          </div>
          ` : `
          <div class="reason-box">
            <strong>📋 Reason for Rejection:</strong>
            <p>The withdrawal request did not meet our verification requirements. Please ensure all account details are correct and try again, or contact support for assistance.</p>
          </div>
          `}

          <div class="info-box">
            <div class="info-row">
              <span class="label">💰 Amount:</span>
              <span class="value">$${parseFloat(amount.toString()).toFixed(2)}</span>
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

          <div class="balance-notice">
            <strong>💰 Your Balance is Unchanged</strong>
            <p style="margin: 0; line-height: 1.6;">
              Don't worry! Your account balance has <strong>not been affected</strong>. The full amount remains in your account and you can submit a new withdrawal request at any time.
            </p>
          </div>

          <div style="text-align: center; margin-top: 35px;">
            <a href="${appUrl}/dashboard/withdrawal" class="button">
              Try New Withdrawal →
            </a>
          </div>

          <p style="text-align: center; color: #4A4A4A; margin-top: 20px;">
            Need help? <a href="mailto:support@nexachain.com" class="support-link">Contact Support</a>
          </p>
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
