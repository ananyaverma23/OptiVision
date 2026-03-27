import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
        slate: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }
      },
      fontFamily: { sans: ['"DM Sans"','system-ui','sans-serif'], mono: ['"JetBrains Mono"','monospace'] },
      animation: { 'fade-in':'fadeIn .2s ease', 'slide-up':'slideUp .25s ease' },
      keyframes: { fadeIn:{from:{opacity:0},to:{opacity:1}}, slideUp:{from:{opacity:0,transform:'translateY(8px)'},to:{opacity:1,transform:'translateY(0)'}} },
      boxShadow: { card:'0 1px 3px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04)', 'card-hover':'0 4px 16px rgba(0,0,0,.08),0 0 0 1px rgba(37,99,235,.1)' }
    }
  },
  plugins: [forms]
};
