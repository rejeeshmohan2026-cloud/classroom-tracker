/**
 * services/accentColorService.js
 *
 * Applies a chosen accent color (see config/accentColorConfig.js) by
 * setting three CSS custom properties directly on the document root:
 * --color-primary-deep (the color itself), --color-on-primary-deep
 * (the correct text color for that specific background — white or
 * dark ink, depending on the option), and --shadow-on-primary-deep
 * (the matching drop-shadow, or none for the two lighter options that
 * use dark text).
 *
 * This works because every "solid blue chrome" surface across the app
 * (headers, Primary buttons, the KPI card, team card headers,
 * Recognition's default avatar) already references these three tokens
 * instead of a hardcoded color — a direct payoff of that unification:
 * making the whole app follow a color choice is three lines of CSS
 * property overrides, not a hunt through every surface.
 *
 * Pure application logic, no I/O — mirrors this project's established
 * split (see the now-superseded services/themeService.js this pattern
 * is adapted from) between resolving/applying a preference and
 * persisting one (services/accentColorPreferenceService.js).
 */

import { getAccentColorById, DEFAULT_ACCENT_COLOR_ID } from '../config/accentColorConfig.js';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(clean.substring(i, i + 2), 16));
}

function relativeLuminance([r, g, b]) {
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * For the full-spectrum custom picker (see UserBar.js): unlike the 5
 * presets, a custom color can be literally anything, so there's no way
 * to pre-verify a pairing for it. This picks whichever of white/dark
 * ink has the higher contrast ratio against the given background —
 * WCAG's own contrast formula, just used to choose rather than to
 * verify a fixed choice. Not a guarantee of passing 4.5:1 (an
 * extremely mid-toned custom color could still fall short either way),
 * but it's the better of the two options for any color given.
 */
export function pickReadableTextColor(backgroundHex) {
  const bgLuminance = relativeLuminance(hexToRgb(backgroundHex));
  const whiteContrast = (1.0 + 0.05) / (bgLuminance + 0.05);
  const darkInkContrast = (bgLuminance + 0.05) / (0.0 + 0.05);
  return whiteContrast >= darkInkContrast ? '#ffffff' : '#1a1a1a';
}

export function applyAccentColor(colorId) {
  const option = getAccentColorById(colorId || DEFAULT_ACCENT_COLOR_ID);
  const root = document.documentElement.style;
  root.setProperty('--color-primary-deep', option.hex);
  root.setProperty('--color-on-primary-deep', option.textColor);
  root.setProperty('--shadow-on-primary-deep', option.shadow);
}

/** For a custom (non-preset) hex from the spectrum picker — computes its own text color/shadow rather than looking one up. */
export function applyCustomAccentColor(hex) {
  const textColor = pickReadableTextColor(hex);
  const root = document.documentElement.style;
  root.setProperty('--color-primary-deep', hex);
  root.setProperty('--color-on-primary-deep', textColor);
  root.setProperty('--shadow-on-primary-deep', textColor === '#ffffff' ? '0 1px 3px rgba(0, 0, 0, 0.35)' : 'none');
}
