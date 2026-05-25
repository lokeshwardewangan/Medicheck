import 'server-only';
import type * as React from 'react';
import { Body, Container, Head, Html, Preview, Section } from 'jsx-email';
import { emailTheme } from '../theme';
import { BrandHeader } from './brand-header';
import { EmailFooter } from './footer';

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
};

const bodyStyle = {
  backgroundColor: emailTheme.color.background,
  color: emailTheme.color.textPrimary,
  fontFamily: emailTheme.font.sans,
  margin: 0,
  padding: '40px 16px',
  WebkitFontSmoothing: 'antialiased' as const,
};

const containerStyle = {
  backgroundColor: emailTheme.color.surface,
  borderRadius: emailTheme.layout.radius,
  border: `1px solid ${emailTheme.color.border}`,
  maxWidth: emailTheme.layout.containerWidth,
  margin: '0 auto',
  overflow: 'hidden' as const,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04)',
};

const innerStyle = {
  padding: '8px 32px 32px',
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <BrandHeader />
          <Section style={innerStyle}>{children}</Section>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
