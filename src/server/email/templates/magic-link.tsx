import 'server-only';
import { Button, Heading, Section, Text } from 'jsx-email';
import { EmailLayout } from '../components/layout';
import { emailTheme } from '../theme';

type MagicLinkEmailProps = {
  url: string;
  expiresInMinutes?: number;
};

const subject = 'Your HealthMate sign-in link';

const headingStyle = {
  margin: '8px 0 12px',
  fontSize: '26px',
  fontWeight: 700,
  color: emailTheme.color.textPrimary,
  letterSpacing: '-0.02em',
  lineHeight: '1.25',
};

const introStyle = {
  margin: '0 0 28px',
  fontSize: '15px',
  lineHeight: '1.6',
  color: emailTheme.color.textSecondary,
};

const actionCardStyle = {
  backgroundColor: emailTheme.color.accentTint,
  border: `1px solid ${emailTheme.color.accentBorder}`,
  borderRadius: emailTheme.layout.radiusSm,
  padding: '28px 24px',
  textAlign: 'center' as const,
  margin: '0 0 28px',
};

const buttonStyle = {
  backgroundColor: emailTheme.color.accent,
  color: emailTheme.color.textInverse,
  fontSize: '15px',
  fontWeight: 600,
  padding: '14px 28px',
  borderRadius: emailTheme.layout.radiusSm,
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.01em',
  boxShadow: '0 1px 2px rgba(13, 148, 136, 0.2)',
};

const expiryStyle = {
  margin: '16px 0 0',
  fontSize: '12px',
  color: emailTheme.color.accentDark,
  fontWeight: 500,
};

const fallbackLabelStyle = {
  margin: '0 0 8px',
  fontSize: '13px',
  fontWeight: 500,
  color: emailTheme.color.textSecondary,
};

const fallbackBoxStyle = {
  margin: '0 0 28px',
  padding: '12px 14px',
  backgroundColor: emailTheme.color.surfaceMuted,
  border: `1px solid ${emailTheme.color.border}`,
  borderRadius: emailTheme.layout.radiusSm,
  fontFamily: emailTheme.font.mono,
  fontSize: '12px',
  color: emailTheme.color.textPrimary,
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
};

const disclaimerStyle = {
  margin: 0,
  padding: '16px 18px',
  backgroundColor: emailTheme.color.surfaceMuted,
  borderLeft: `3px solid ${emailTheme.color.borderStrong}`,
  borderRadius: '0 6px 6px 0',
  fontSize: '12px',
  color: emailTheme.color.textMuted,
  lineHeight: '1.6',
};

export function MagicLinkEmail({ url, expiresInMinutes = 10 }: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview={`Sign in to ${emailTheme.brand.name} — link expires in ${expiresInMinutes} minutes`}
    >
      <Heading as="h1" style={headingStyle}>
        Sign in to your account
      </Heading>

      <Text style={introStyle}>
        Welcome back. Tap the button below to securely sign in to {emailTheme.brand.name}. No
        password needed.
      </Text>

      <Section style={actionCardStyle}>
        <Button href={url} height={48} width={260} style={buttonStyle}>
          Sign in to {emailTheme.brand.name}
        </Button>
        <Text style={expiryStyle}>
          Expires in {expiresInMinutes} minutes &middot; Single use only
        </Text>
      </Section>

      <Text style={fallbackLabelStyle}>Trouble with the button? Copy and paste this link:</Text>
      <div style={fallbackBoxStyle}>{url}</div>

      <Text style={disclaimerStyle}>
        Didn&apos;t request this email? You can safely ignore it &mdash; someone may have entered
        your address by mistake. Your account stays secure.
      </Text>
    </EmailLayout>
  );
}

MagicLinkEmail.subject = subject;
