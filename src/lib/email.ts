import "server-only";
import { Resend } from "resend";

interface InviteEmailPayload {
  email: string;
  name: string;
  ward: string;
  role: "councillor" | "admin";
  inviteLink: string;
}

interface OtpEmailPayload {
  email: string;
  code: string;
}

// hellohyperlocal.co.za is verified in Resend — send from it, not the sandbox default.
const FROM_ADDRESS = "Hello Linden <noreply@hellohyperlocal.co.za>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Single seam for invite email delivery. Sends via Resend when RESEND_API_KEY
 * is configured; falls back to a console log (and the invite link is also
 * always returned directly to the UI for the admin to copy manually either way).
 */
export async function sendInviteEmail(payload: InviteEmailPayload): Promise<void> {
  const resend = getClient();
  const summary =
    `"${payload.name}" invited as ${payload.role}` +
    (payload.role === "councillor" ? ` for ${payload.ward}` : "") +
    ` — ${payload.inviteLink}`;

  if (!resend) {
    console.log(`[email:invite] RESEND_API_KEY not set, would send to ${payload.email}: ${summary}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: payload.email,
    subject: `You've been invited to Hello Linden`,
    html: `
      <p>Hi ${payload.name},</p>
      <p>You've been invited as a ${payload.role}${payload.role === "councillor" ? ` for ${payload.ward}` : ""} on Hello Linden.</p>
      <p><a href="${payload.inviteLink}">Accept your invite</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });

  if (error) {
    console.error(`[email:invite] Resend failed for ${payload.email}:`, error);
  }
}

/**
 * First-login OTP email. Same fallback behavior as sendInviteEmail: logs
 * instead of throwing if RESEND_API_KEY isn't configured, so local/demo use
 * doesn't hard-fail — but note the code itself is never shown in the UI, so
 * without Resend configured a first-time admin login is a genuine dead end
 * until the key is set.
 */
export async function sendOtpEmail(payload: OtpEmailPayload): Promise<void> {
  const resend = getClient();

  if (!resend) {
    console.log(`[email:otp] RESEND_API_KEY not set, would send to ${payload.email}: code ${payload.code}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: payload.email,
    subject: `Your Hello Linden admin verification code`,
    html: `
      <p>Your one-time verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${payload.code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });

  if (error) {
    console.error(`[email:otp] Resend failed for ${payload.email}:`, error);
  }
}
