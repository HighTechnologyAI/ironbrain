// Tiger Neon UI v2 - Runtime theme system

interface NeonThemeConfig {
  accent?: string;
  background?: string;
  surface1?: string;
  surface2?: string;
  border?: string;
  text?: string;
  textMuted?: string;
}

// Convert hex to HSL
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Adjust lightness for color variants
const adjustLightness = (hsl: string, adjustment: number): string => {
  const [h, s, l] = hsl.split(' ');
  const lightness = parseInt(l.replace('%', ''));
  const newLightness = Math.max(0, Math.min(100, lightness + adjustment));
  return `${h} ${s} ${newLightness}%`;
};

// Apply theme to document root
export const applyNeonTheme = (config: NeonThemeConfig = {}) => {
  const root = document.documentElement;
  
  if (config.accent) {
    const accentHsl = config.accent.startsWith('#') ? hexToHsl(config.accent) : config.accent;
    root.style.setProperty('--acc-prop', accentHsl);
    root.style.setProperty('--acc-600-prop', adjustLightness(accentHsl, -6));
  }
  
  if (config.background) {
    const bgHsl = config.background.startsWith('#') ? hexToHsl(config.background) : config.background;
    root.style.setProperty('--bg', bgHsl);
  }
  
  // Add other theme properties as needed
};

import { ConfigService } from '@/services/configService';

// Check if Neon UI v2 is enabled
export const isNeonUIEnabled = (): boolean => {
  return ConfigService.isFeatureEnabled('neonUI');
};

// Get accent color from environment
export const getAccentColor = (): string => {
  return ConfigService.getUIConfig().accentColor;
};

// Initialize theme system
export const initializeNeonTheme = () => {
  if (!isNeonUIEnabled()) return;
  
  // Apply theme with environment accent color
  applyNeonTheme({
    accent: getAccentColor()
  });
  
  // Add neon UI class to enable styles
  document.documentElement.classList.add('neon-ui-v2');
  
  // Enable dark mode for shadcn components
  document.documentElement.classList.add('dark');
};

// Predefined color palette for quick access
export const neonColors = {
  primary: '154 86% 42%',      // #16C172
  primaryHover: '154 74% 36%', // #13A765
  background: '216 100% 7%',   // #0B0F14
  surface1: '220 24% 10%',     // #0F141A
  surface2: '216 33% 12%',     // #121922
  border: '219 33% 16%',       // #1D2633
  text: '210 29% 85%',         // #D6E2F3
  textMuted: '211 24% 70%',    // #9BB0C9
  warning: '44 96% 63%',       // #F6C945
  danger: '0 100% 67%',        // #FF5A5A
  info: '207 100% 62%',        // #3FA7FF
  success: '154 90% 47%',      // #1FD38A
};

// Export theme utilities
export type { NeonThemeConfig };