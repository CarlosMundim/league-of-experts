// tailwind.config.js - League of Experts
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gpt-blue': '#4F96D8',
        'claude-orange': '#F9A826',
        'gemini-purple': '#9B51E0',
        'deepseek-green': '#2CA58D',
        'katana-red': '#DC2626',
        'synthesis-green': '#059669',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
