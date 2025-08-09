import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register a simple service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
