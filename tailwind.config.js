/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Legacy theme vars (kept for the rest of the app).
        dark: 'var(--dark)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',

        // Qadam onboarding design system (docs/onboarding-design-handoff.md §4).
        blue: {
          50: '#EEF3FF',
          100: '#DCE6FF',
          200: '#BBCEFF',
          400: '#5C86FF',
          500: '#2F6BFF',
          600: '#1E54E8',
          700: '#1A45BE',
        },
        teal: { 500: '#15C7A9' },
        amber: { 500: '#FFB020' },
        ink: {
          900: '#0E1526',
          700: '#33405C',
          500: '#64708C',
          300: '#A7B0C4',
        },
        surface: {
          app: '#F5F7FC',
          tint: '#EEF3FF',
          field: '#EDF0F7',
        },
        line: {
          200: '#E6EAF2',
          300: '#D7DDEA',
        },
      },
      borderRadius: {
        md: '16px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },
      fontFamily: {
        display: ['Nunito_800ExtraBold'],
        body: ['Onest_400Regular'],
        bodyBold: ['Onest_600SemiBold'],
      },
    },
  },
  plugins: [],
};
