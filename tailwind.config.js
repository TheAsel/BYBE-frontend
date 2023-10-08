/** @type {import('tailwindcss').Config} */
import preline from 'preline/plugin.js';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', 'node_modules/preline/dist/*.js'],
  plugins: [preline],
  darkMode: 'class',
  prefix: 'tw-',
  theme: {}
};
