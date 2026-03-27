import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sega/SNES-era warm earth palette
        cream: {
          50: '#FFF8E7',
          100: '#FFF0CC',
          200: '#FFE8A3',
          300: '#FFE080',
          400: '#FFD566',
          500: '#FFCC4D',
          600: '#E6B347',
          700: '#CC9933',
          800: '#B3862B',
          900: '#996E23',
        },
        terracotta: {
          50: '#FFF0EC',
          100: '#FFD9D0',
          200: '#FFBBA8',
          300: '#FF9878',
          400: '#FF6F48',
          500: '#FF5526',
          600: '#E6441A',
          700: '#CC3310',
          800: '#B32608',
          900: '#991D00',
        },
        forest: {
          50: '#F0F7F0',
          100: '#D4EBD4',
          200: '#A8D7A8',
          300: '#78BF78',
          400: '#4CA64C',
          500: '#2D8A2D',
          600: '#237823',
          700: '#1A661A',
          800: '#145414',
          900: '#0F410F',
        },
        ink: {
          50: '#F5F0EA',
          100: '#E8DFD0',
          200: '#D4C5A9',
          300: '#C0AB7E',
          400: '#B09158',
          500: '#9A7B3C',
          600: '#7A6330',
          700: '#5C4B26',
          800: '#45381F',
          900: '#302818',
        },
        pixel: {
          bg: '#FFF8E7',
          border: '#5C4B26',
          borderLight: '#B09158',
          shadow: '#302818',
          text: '#302818',
          muted: '#7A6330',
        },
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'cursive'],
        body: ['Quicksand', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        pixel: '3px 3px 0px 0px #302818',
        'pixel-sm': '2px 2px 0px 0px #302818',
        'pixel-lg': '5px 5px 0px 0px #302818',
        'pixel-inset': 'inset 3px 3px 0px 0px #B09158, inset -1px -1px 0px 0px #5C4B26',
        'pixel-inset-sm': 'inset 2px 2px 0px 0px #B09158, inset -1px -1px 0px 0px #5C4B26',
      },
      borderWidth: {
        pixel: '3px',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #B09158 1px, transparent 1px)',
        'dot-grid-sm': 'radial-gradient(circle, #D4C5A9 1px, transparent 1px)',
        'pixel-border':
          'linear-gradient(135deg, #5C4B26 25%, transparent 25%, transparent 75%, #5C4B26 75%)  0 0 / 8px 8px',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pixel-glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s step-end infinite',
        'pixel-bounce': 'pixel-bounce 0.5s ease-in-out',
        'pixel-glitch': 'pixel-glitch 0.3s ease-in-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
