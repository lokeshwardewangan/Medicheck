import 'server-only';
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY ?? '';
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

if (!apiKey) {
  console.warn('[email] RESEND_API_KEY is not set — outbound email will fail');
}

const resend = new Resend(apiKey);

export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  const subject = 'Your MediCheck sign-in link';
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Sign in to MediCheck</h1>
      <p style="margin: 0 0 24px; color: #525252;">
        Click the button below to sign in. This link expires in 10 minutes and can only be used once.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${url}" style="display: inline-block; padding: 12px 20px; background: #171717; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Sign in
        </a>
      </p>
      <p style="margin: 0; font-size: 12px; color: #a3a3a3;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[email] failed to send magic link:', error);
    throw new Error('Failed to send sign-in email');
  }
}
