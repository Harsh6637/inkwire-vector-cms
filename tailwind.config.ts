// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}', // include all TypeScript and TSX files
  ],
  theme: {
    extend: {
      // add custom colors, fonts, spacing, etc. here if needed
    },
  },
  plugins: [],
};

export default config;
