/**
 * Contrast-Safe Text Coloring Utility
 * 
 * Automatically determines the best text color (light or dark) based on background luminance
 * to ensure WCAG AAA compliance (4.5:1 minimum contrast ratio)
 */

/**
 * Calculate relative luminance of an RGB color
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Luminance value (0-1)
 */
function calculateLuminance(r: number, g: number, b: number): number {
  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse HSL color string and return RGB values
 * @param hslString HSL color string (e.g., "152 69% 31%")
 * @returns [r, g, b] values or null if invalid
 */
function hslToRgb(hslString: string): [number, number, number] | null {
  const match = hslString.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return null;

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
}

/**
 * Determine if a background color needs light or dark text for sufficient contrast
 * @param bgHslString Background color in HSL format (e.g., "152 69% 31%")
 * @returns 'light' for light text (on dark backgrounds) or 'dark' for dark text (on light backgrounds)
 */
export function getContrastText(bgHslString: string): 'light' | 'dark' {
  const rgb = hslToRgb(bgHslString);
  if (!rgb) return 'dark'; // Safe default

  const luminance = calculateLuminance(rgb[0], rgb[1], rgb[2]);

  // If luminance > 0.5, background is bright → use dark text
  // If luminance <= 0.5, background is dark → use light text
  return luminance > 0.5 ? 'dark' : 'light';
}

/**
 * Get contrast-safe text color as CSS class
 * @param bgHslString Background color in HSL format
 * @returns Tailwind class for text color with proper contrast
 */
export function getContrastTextClass(bgHslString: string): string {
  return getContrastText(bgHslString) === 'light'
    ? 'text-white'
    : 'text-foreground';
}

/**
 * Get contrast ratio between two colors
 * @param color1 First color in HSL format
 * @param color2 Second color in HSL format
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hslToRgb(color1);
  const rgb2 = hslToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = calculateLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = calculateLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors meet WCAG contrast requirements
 * @param bgColor Background color in HSL format
 * @param textColor Text color in HSL format
 * @param level 'AA' (4.5:1) or 'AAA' (7:1)
 * @returns boolean indicating if contrast is sufficient
 */
export function meetsWCAGStandard(
  bgColor: string,
  textColor: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(bgColor, textColor);
  const minRatio = level === 'AA' ? 4.5 : 7;
  return ratio >= minRatio;
}

export default {
  getContrastText,
  getContrastTextClass,
  getContrastRatio,
  meetsWCAGStandard,
};
