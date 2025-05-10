/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import lineClamp from '@tailwindcss/line-clamp';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    lineClamp,
  ],
} 