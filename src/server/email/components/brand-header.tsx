import 'server-only';
import { Section, Text } from 'jsx-email';
import { emailTheme } from '../theme';

const accentStripeStyle = {
  height: '4px',
  background: `linear-gradient(90deg, ${emailTheme.color.accent} 0%, ${emailTheme.color.accentDark} 100%)`,
  backgroundColor: emailTheme.color.accent,
  lineHeight: '4px',
  fontSize: '4px',
};

const headerStyle = {
  padding: '28px 32px 24px',
  backgroundColor: emailTheme.color.surface,
};

const logoRowStyle = {
  display: 'inline-block',
  verticalAlign: 'middle',
};

const badgeStyle = {
  display: 'inline-block',
  width: '36px',
  height: '36px',
  lineHeight: '36px',
  borderRadius: '10px',
  backgroundColor: emailTheme.color.accent,
  color: emailTheme.color.textInverse,
  fontSize: '18px',
  fontWeight: 700,
  textAlign: 'center' as const,
  verticalAlign: 'middle',
  marginRight: '12px',
  letterSpacing: '-0.01em',
};

const wordmarkStyle = {
  margin: 0,
  display: 'inline-block',
  verticalAlign: 'middle',
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: emailTheme.color.textPrimary,
  lineHeight: '1.2',
};

const taglineStyle = {
  margin: '8px 0 0',
  fontSize: '13px',
  color: emailTheme.color.textMuted,
  lineHeight: '1.4',
};

export function BrandHeader() {
  return (
    <>
      <Section style={accentStripeStyle}>&nbsp;</Section>
      <Section style={headerStyle}>
        <div style={logoRowStyle}>
          <span style={badgeStyle}>{emailTheme.brand.initial}</span>
          <span style={wordmarkStyle}>{emailTheme.brand.name}</span>
        </div>
        <Text style={taglineStyle}>{emailTheme.brand.tagline}</Text>
      </Section>
    </>
  );
}
