// ─────────────────────────────────────────────────────────
//  utils/sendEmail.js — Email Service (Nodemailer)
// ─────────────────────────────────────────────────────────
const nodemailer = require("nodemailer");

/**
 * Create reusable transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error: ${error.message}`);
    // Don't throw — let the caller decide how to handle
    return { success: false, error: error.message };
  }
};

// ─── Email Templates ────────────────────────────────────

/**
 * Send OTP for email verification
 */
const sendVerificationOTP = async (email, name, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f0f0f; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Verify Your Email</h1>
      </div>
      <div style="padding: 40px 32px;">
        <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          Hey <strong style="color: #fff;">${name}</strong>,
        </p>
        <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
          Use the OTP below to verify your email address. This code expires in <strong style="color: #e0e0e0;">10 minutes</strong>.
        </p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a4e; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${otp} — Your Verification Code`,
    html,
  });
};

/**
 * Send password reset link
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f0f0f; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Reset Your Password</h1>
      </div>
      <div style="padding: 40px 32px;">
        <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          Hey <strong style="color: #fff;">${name}</strong>,
        </p>
        <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
          We received a request to reset your password. Click the button below to set a new password. This link expires in <strong style="color: #e0e0e0;">15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 0 0 32px;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0 0 16px; text-align: center;">
          Or copy this link into your browser:
        </p>
        <p style="color: #667eea; font-size: 12px; word-break: break-all; text-align: center; margin: 0 0 24px;">
          ${resetUrl}
        </p>
        <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationOTP,
  sendPasswordResetEmail,
};
