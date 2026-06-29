/** @type {import('tailwindcss').Config} */
// Brand tokens are locked. See design-system/toan-huy-hoang/MASTER.md.
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Slate-teal dark family (replaces the former emerald greens).
        bg: '#0D1A24',
        'bg-2': '#1C2630',
        card: '#243441',
        // Golds: primary accent on dark, brighter variant, and the deeper
        // gold used for text on the cream (light) surfaces.
        gold: '#C9A24B',
        'gold-2': '#D8AF5B',
        // Deeper antique gold for text/labels on light surfaces (WCAG AA >=4.5:1).
        // Keep in lockstep with --gold-ink in src/styles/index.css.
        'gold-ink': '#8a6420',
        // Cream light surface + its ink colors.
        cream: '#F4EFE6',
        ink: '#1C2630',
        text: '#F4F4F1',
      },
      fontFamily: {
        // High-contrast editorial serif for headlines.
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Geometric grotesque for body and UI.
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.32em',
        button: '0.18em',
      },
      maxWidth: {
        container: '1320px',
        prose: '60ch',
      },
      borderColor: {
        line: 'rgba(201,162,75,0.24)',
      },
      boxShadow: {
        card: '0 24px 60px -24px rgba(0,0,0,0.7)',
        ring: '0 0 0 2px rgba(201,162,75,0.7)',
      },
      transitionTimingFunction: {
        'lux-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'lux-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      // Cream-surface prose theme for Guides article bodies (Markdown).
      // Used via "prose prose-cream" so headings/links/text read on cream.
      typography: {
        cream: {
          css: {
            '--tw-prose-body': 'rgba(28,38,48,0.85)',
            '--tw-prose-headings': '#1c2630',
            '--tw-prose-links': '#8a6420',
            '--tw-prose-bold': '#1c2630',
            '--tw-prose-counters': 'rgba(28,38,48,0.6)',
            '--tw-prose-bullets': 'rgba(201,162,75,0.55)',
            '--tw-prose-hr': 'rgba(28,38,48,0.12)',
            '--tw-prose-quotes': '#1c2630',
            '--tw-prose-quote-borders': '#8a6420',
            '--tw-prose-captions': 'rgba(28,38,48,0.6)',
            '--tw-prose-code': '#1c2630',
            '--tw-prose-th-borders': 'rgba(28,38,48,0.2)',
            '--tw-prose-td-borders': 'rgba(28,38,48,0.12)',
          },
        },
      },
    },
  },
  plugins: [typography],
}
