/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared-auth/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        otto: {
          primary:   '#0f172a',
          secondary: '#065f46',   // verde nobre
          accent:    '#059669',
          success:   '#22c55e',
          warning:   '#f59e0b',
          danger:    '#ef4444',
          surface:   '#f0fdf4',
          border:    '#d1fae5',
        },
      },
    },
  },
  plugins: [],
}
