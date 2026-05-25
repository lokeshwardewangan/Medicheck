import 'server-only';
import type * as React from 'react';
import { Resend } from 'resend';
import { render, renderPlainText } from 'jsx-email';
import { env } from '@/env';
import { MagicLinkEmail } from './templates/magic-link';

const apiKey = env.RESEND_API_KEY ?? '';
const fromEmail = env.RESEND_FROM_EMAIL;

if (!apiKey) {
  console.warn('[email] RESEND_API_KEY is not set — outbound email will fail');
}

const resend = new Resend(apiKey);

type SendArgs = {
  to: string;
  subject: string;
  component: React.ReactElement;
};

async function send({ to, subject, component }: SendArgs): Promise<void> {
  const [html, text] = await Promise.all([render(component), renderPlainText(component)]);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error(`[email] failed to send "${subject}":`, error);
    throw new Error(`Failed to send email: ${subject}`);
  }
}

export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  await send({
    to,
    subject: MagicLinkEmail.subject,
    component: <MagicLinkEmail url={url} />,
  });
}
