/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        category: {
          flagship: '#1f4e79',
          backbone: '#2e7d5b',
          specialist: '#8b5e3c',
          regional:  '#6a4c93',
          mission:   '#8c3a3a',
        },
        status: {
          operational:    '#2f6f3f',
          upgrading:      '#b78a1f',
          planned:        '#9aa0a6',
          decommissioned: '#c4c4c4',
        },
        surface: '#fbfaf7',
        ink:     '#1a1a1a',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
