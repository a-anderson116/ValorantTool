/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        val: {
          red: '#FF4655',
          dark: '#0F1923',
          darker: '#0A1117',
          card: '#1A2634',
          border: '#1F3147',
          accent: '#FF4655',
          gold: '#FFD700',
          teal: '#00C8BE',
          muted: '#7B9BAF',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  },
  plugins: []
}
