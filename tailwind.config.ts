import type { Config } from 'tailwindcss';

// Tailwind configuration used by this project.  The content array tells
// Tailwind where to find class names for purging unused styles.  Dark
// mode is enabled via the `class` strategy, allowing you to toggle
// themes using next-themes.  Custom extensions can be added to the
// `extend` section.
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;