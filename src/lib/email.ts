// src/lib/email.ts
// Centralized email service using Nodemailer with Gmail SMTP
import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
};

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const recipients = Array.isArray(to) ? to.join(', ') : to;

    console.log(`📧 [EMAIL] Sending to: ${recipients}`);
    console.log(`📧 [EMAIL] Subject: ${subject}`);

    const info = await transporter.sendMail({
      from: `"Nexachain" <${process.env.GMAIL_USER}>`,
      to: recipients,
      subject,
      html,
    });

    console.log(`✅ [EMAIL] Sent successfully! Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [EMAIL] Failed to send:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send to multiple recipients individually (for personalized emails)
export async function sendEmailToMultiple(
  recipients: { email: string; name?: string }[],
  getEmailContent: (recipient: { email: string; name?: string }) => { subject: string; html: string }
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      const { subject, html } = getEmailContent(recipient);
      const result = await sendEmail({
        to: recipient.email,
        subject,
        html,
      });
      return { ...result, email: recipient.email };
    })
  );

  const success = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const errors = results.filter((r) => !r.success).map((r) => `${r.email}: ${r.error}`);

  console.log(`📧 [EMAIL] Batch complete: ${success} sent, ${failed} failed`);

  return { success, failed, errors };
}
