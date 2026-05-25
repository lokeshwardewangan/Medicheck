import 'server-only';

// Centralized email design tokens. Email clients are extremely conservative,
// so stick to absolute units, hex colors, and inline styles.
export const emailTheme = {
  brand: {
    name: 'HealthMate',
    tagline: 'Symptom triage made simple',
    initial: 'H',
  },
  color: {
    // Surfaces
    background: '#f4f6f8',
    surface: '#ffffff',
    surfaceMuted: '#fafbfc',
    border: '#e6e8eb',
    borderStrong: '#d4d7dc',

    // Text
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    // Brand accent (teal — calm, medical)
    accent: '#0d9488',
    accentHover: '#0f766e',
    accentDark: '#115e59',
    accentTint: '#f0fdfa',
    accentBorder: '#ccfbf1',

    // Semantic
    info: '#0284c7',
    infoTint: '#f0f9ff',
  },
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    mono: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  layout: {
    containerWidth: '560px',
    radius: '14px',
    radiusSm: '8px',
  },
} as const;

export type EmailTheme = typeof emailTheme;
