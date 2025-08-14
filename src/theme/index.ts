/**
 * Tiger Neon UI v2 Theme System
 * 
 * This module handles dynamic theming for the Tiger Neon UI system,
 * including runtime accent color application and theme utilities.
 */

export interface NeonThemeConfig {
  accent?: string;
  background?: string;
  surface1?: string;
  surface2?: string;
  border?: string;
  text?: string;
  textMuted?: string;
}

/**
 * Apply Tiger Neon UI v2 theme tokens to the document
 */
export const applyNeonTheme = (config: NeonThemeConfig = {}) => {
  const root = document.documentElement;
  
  // Apply accent color from environment or config
  const accentColor = config.accent || import.meta.env.VITE_UI_V2_ACCENT || '#16C172';
  
  // Convert hex to HSL if needed
  const accentHsl = hexToHsl(accentColor);
  const accent600Hsl = adjustLightness(accentHsl, -10);
  
  // Set CSS custom properties
  root.style.setProperty('--neon-accent-override', accentHsl);
  root.style.setProperty('--neon-accent-600-override', accent600Hsl);
  
  // Apply other theme tokens if provided
  if (config.background) root.style.setProperty('--neon-bg', config.background);
  if (config.surface1) root.style.setProperty('--neon-surface-1', config.surface1);
  if (config.surface2) root.style.setProperty('--neon-surface-2', config.surface2);
  if (config.border) root.style.setProperty('--neon-border', config.border);
  if (config.text) root.style.setProperty('--neon-text', config.text);
  if (config.textMuted) root.style.setProperty('--neon-text-muted', config.textMuted);
};

/**
 * Check if Tiger Neon UI v2 is enabled
 */
export const isNeonUIEnabled = (): boolean => {
  return import.meta.env.VITE_UI_V2_ENABLED === 'true';
};

/**
 * Get the current accent color
 */
export const getAccentColor = (): string => {
  return import.meta.env.VITE_UI_V2_ACCENT || '#16C172';
};

/**
 * Convert hex color to HSL string
 */
const hexToHsl = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

/**
 * Adjust lightness of an HSL color
 */
const adjustLightness = (hsl: string, adjustment: number): string => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  
  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = Math.max(0, Math.min(100, parseInt(match[3]) + adjustment));
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Tiger Neon UI v2 color palette
 */
export const neonColors = {
  background: 'hsl(216, 30%, 5%)',
  surface1: 'hsl(215, 25%, 8%)',
  surface2: 'hsl(214, 20%, 11%)',
  border: 'hsl(214, 15%, 18%)',
  text: 'hsl(215, 30%, 87%)',
  textMuted: 'hsl(215, 20%, 65%)',
  accent: 'hsl(153, 85%, 41%)',
  accent600: 'hsl(153, 85%, 35%)',
  warning: 'hsl(45, 90%, 63%)',
  danger: 'hsl(0, 100%, 67%)',
  info: 'hsl(210, 100%, 63%)',
  success: 'hsl(153, 85%, 55%)',
} as const;

/**
 * Initialize Tiger Neon UI v2 theme
 */
export const initializeNeonTheme = () => {
  if (isNeonUIEnabled()) {
    applyNeonTheme();
    
    // Import theme CSS
    import('./tokens.css');
    
    // Ensure dark mode is enabled
    document.documentElement.classList.add('dark');
  }
};