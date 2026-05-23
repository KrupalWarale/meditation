/**
 * File: tailwind.config.ts
 *
 * Description: Tailwind CSS configuration for the admin panel. Defines the custom
 * color palette (forest greens), typography (Inter + Playfair Display), and content
 * paths for class scanning.
 *
 * Author: Navnit(Ninjacode911)
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        secondary: '#2D6A4F',
        accent: '#40916C',
        background: '#FAFAF5',
        surface: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
