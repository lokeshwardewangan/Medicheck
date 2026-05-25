import 'server-only';
import { Hr, Link, Section, Text } from 'jsx-email';
import { emailTheme } from '../theme';

const footerStyle = {
  padding: '24px 32px 32px',
  backgroundColor: emailTheme.color.surfaceMuted,
};

const dividerStyle = {
  borderColor: emailTheme.color.border,
  margin: '0 0 20px',
};

const disclaimerStyle = {
  margin: '0 0 12px',
  fontSize: '11px',
  color: emailTheme.color.textMuted,
  lineHeight: '1.6',
};

const metaStyle = {
  margin: 0,
  fontSize: '11px',
  color: emailTheme.color.textMuted,
  lineHeight: '1.5',
};

const linkStyle = {
  color: emailTheme.color.accent,
  textDecoration: 'none',
  fontWeight: 500,
};

const separatorStyle = {
  margin: '0 8px',
  color: emailTheme.color.borderStrong,
};

export function EmailFooter() {
  const year = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://healthmate.app';
  const displayUrl = appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <Section style={footerStyle}>
      <Hr style={dividerStyle} />
      <Text style={disclaimerStyle}>
        {emailTheme.brand.name} provides general information only and is not a substitute for
        professional medical advice. In an emergency, please call your local emergency number
        immediately.
      </Text>
      <Text style={metaStyle}>
        &copy; {year} {emailTheme.brand.name}
        <span style={separatorStyle}>&middot;</span>
        <Link href={appUrl} style={linkStyle}>
          {displayUrl}
        </Link>
      </Text>
    </Section>
  );
}
