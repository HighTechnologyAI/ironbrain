import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './theme/tokens.css'
import { initializeNeonTheme } from './theme'

// Initialize Tiger Neon UI v2 theme system
initializeNeonTheme();

// Register a simple service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
