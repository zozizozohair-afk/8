/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        'secondary-text': 'var(--color-secondary-text)',
        'border-light': 'var(--color-border-light)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
