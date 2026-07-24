/**
 * config/accentColorConfig.js
 *
 * Accent-color options a teacher can choose between (5 presets, plus a
 * full-spectrum custom picker in the UI — see UserBar.js) — applied to
 * every "solid blue chrome" surface across the app (headers, Primary
 * buttons, the KPI card, team card headers, Recognition's avatar) since
 * all of those already reference the same two tokens
 * (--color-primary-deep / --color-on-primary-deep) rather than a
 * hardcoded color.
 *
 * `textColor` is normally a WCAG-driven fact about each background, not
 * a style preference — computed and verified before being added here.
 * The one exception is Ocean (the default): white text on it measures
 * 2.64:1, below the standard 4.5:1 threshold — set anyway, per explicit
 * override instruction (see that option's own comment below). Every
 * other preset's pairing is still a real, verified contrast fact:
 * Sunset is light enough that white fails too (3.19:1), so it uses
 * dark ink (5.45:1); Classic/Emerald/Plum are dark enough that white
 * passes (5.75:1 / 5.47:1 / 6.35:1) and dark ink would fail. See
 * CHANGELOG.md for the full numbers and history.
 *
 * `shadow` pairs with `textColor`: a dark drop-shadow behind white text
 * adds a little legibility against a busy background; behind dark ink
 * it would do nothing useful, so Sunset (the one preset using dark ink)
 * has none.
 */

export const ACCENT_COLOR_OPTIONS = Object.freeze([
  {
    id: 'ocean',
    label: 'Ocean',
    hex: '#5ea6da',
    /* Overridden per explicit direction: white text on this background
       measures 2.64:1, below the standard 4.5:1 (and below even the
       large-text 3:1 exception for most text on this screen). Flagged
       once, clearly, at the point this was requested — implemented as
       instructed, since this is the product's own color/accessibility
       trade-off to make, not something to silently block. */
    textColor: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  {
    id: 'classic',
    label: 'Classic',
    hex: '#1565c0',
    textColor: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    hex: '#256f59',
    textColor: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  {
    id: 'plum',
    label: 'Plum',
    hex: '#6b4fa8',
    textColor: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    hex: '#d9762e',
    textColor: '#1a1a1a',
    shadow: 'none',
  },
]);

export const DEFAULT_ACCENT_COLOR_ID = 'ocean';

export function getAccentColorById(id) {
  return ACCENT_COLOR_OPTIONS.find((option) => option.id === id) || ACCENT_COLOR_OPTIONS.find((option) => option.id === DEFAULT_ACCENT_COLOR_ID);
}
