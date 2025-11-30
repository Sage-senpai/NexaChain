// src/app/api/send-deposit-email/route.ts
// FIXED VERSION - Ready for production
import { NextRequest } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admins, deposit, proof_image } = body;

    if (!admins || admins.length === 0) {
      return Response.json({ 
        error: "No admin emails found" 
      }, { status: 400 });
    }

    const emailPromises = admins.map(async (admin: any) => {
      const emailHTML = `
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
              background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); 
              padding: 30px; 
              text-align: center; 
            }
            .header h1 { 
              color: white; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700;
            }
            .content { 
              padding: 30px; 
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
            }
            .amount { 
              font-size: 36px; 
              font-weight: 700; 
              color: #D4AF37; 
              text-align: center; 
              margin: 25px 0; 
              padding: 20px;
              background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
              border-radius: 12px;
            }
            .proof-image { 
              width: 100%; 
              max-width: 500px; 
              border-radius: 12px; 
              margin: 20px auto; 
              display: block;
              border: 3px solid #D4AF37; 
              box-shadow: 0 4px 8px rgba(212, 175, 55, 0.2);
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
              transition: all 0.3s ease;
            }
            .button:hover {
              box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
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
            .alert-box {
              background-color: #FEF3C7;
              border: 2px solid #FCD34D;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Deposit Pending Approval</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; color: #000000; margin-bottom: 10px;">
                Hello <strong>${admin.full_name || 'Admin'}</strong>,
              </p>
              
              <p style="color: #4A4A4A; margin-bottom: 25px;">
                A new deposit has been submitted and requires your review:
              </p>
              
              <div class="amount">
                ${deposit.plan_emoji} $${parseFloat(deposit.amount).toFixed(2)}
              </div>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">👤 User:</span>
                  <span class="value">${deposit.user_name}</span>
                </div>
                <div class="info-row">
                  <span class="label">📧 Email:</span>
                  <span class="value">${deposit.user_email}</span>
                </div>
                <div class="info-row">
                  <span class="label">📊 Plan:</span>
                  <span class="value">${deposit.plan_emoji} ${deposit.plan_name}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Amount:</span>
                  <span class="value">$${parseFloat(deposit.amount).toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">🪙 Crypto:</span>
                  <span class="value">${deposit.crypto_type}</span>
                </div>
                <div class="info-row">
                  <span class="label">📅 Date:</span>
                  <span class="value">${new Date(deposit.created_at).toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="label">🆔 Deposit ID:</span>
                  <span class="value">${deposit.id.substring(0, 8)}...</span>
                </div>
              </div>
              
              <h3 style="color: #000000; margin-top: 30px; margin-bottom: 15px;">
                📸 Proof of Payment:
              </h3>
              ${proof_image ? `<img src="${proof_image}" alt="Payment Proof" class="proof-image" />` : '<p style="color: #EF4444; background-color: #FEE2E2; padding: 15px; border-radius: 8px; border: 2px solid #EF4444;">⚠️ No proof image provided</p>'}
              
              <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">
                  Review Deposit in Admin Panel →
                </a>
              </div>
              
              <div class="alert-box">
                <strong>⚠️ Action Required:</strong>
                <p style="margin: 0; line-height: 1.6;">
                  Please review the deposit and proof of payment carefully, then approve or reject in your admin dashboard. 
                  The user is waiting for confirmation to start their investment.
                </p>
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

      // Send email using Resend
      try {
        const { data, error } = await resend.emails.send({
          from: 'Nexachain Admin <onboarding@resend.dev>', // ✅ FIXED - Valid email format
          to: admin.email,
          subject: `🔔 New Deposit: $${parseFloat(deposit.amount).toFixed(2)} from ${deposit.user_name}`,
          html: emailHTML,
        });

        if (error) {
          console.error(`Failed to send email to ${admin.email}:`, error);
          return { success: false, email: admin.email, error };
        }

        console.log(`✅ Email sent successfully to ${admin.email}`);
        return { success: true, email: admin.email, data };
      } catch (error) {
        console.error(`Error sending email to ${admin.email}:`, error);
        return { success: false, email: admin.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount > 0) {
      console.error(`Email sending completed with ${failureCount} failures`);
    }

    return Response.json({ 
      success: true, 
      message: `Emails sent to ${successCount}/${admins.length} admin(s)`,
      results: results
    });
  } catch (err) {
    console.error("Send email error:", err);
    return Response.json({ 
      error: "Failed to send emails",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}