import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './theme/tokens.css'
import './i18n'

// Initialize basic logging
console.log('Main: Starting application...');

// Register a simple service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
