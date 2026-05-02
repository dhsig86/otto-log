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
          secondary: '#1e40af',
          accent:    '#3b82f6',
          success:   '#22c55e',
          warning:   '#f59e0b',
          danger:    '#ef4444',
          surface:   '#f8fafc',
          border:    '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
}
