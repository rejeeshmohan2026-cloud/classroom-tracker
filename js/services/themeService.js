/**
 * services/themeService.js
 *
 * Resolves a stored theme preference ('light' | 'dark' | 'system') to
 * an actual applied theme ('light' | 'dark') and sets
 * `document.documentElement.dataset.theme` accordingly — the attribute
 * `[data-theme="dark"]` in css/styles.css keys off of (see that file's
 * Phase 6A comment block for why only theme-DEPENDENT tokens are
 * overridden there, and why --color-on-brand deliberately isn't one of
 * them).
 *
 * 'system' is not a third token set — it's a resolution rule that reads
 * `window.matchMedia('(prefers-color-scheme: dark)')` and stays live:
 * if the OS-level setting changes while 'system' is selected, the
 * applied theme updates immediately, without needing a page reload.
 * Switching away from 'system' tears that listener down, so an explicit
 * Light/Dark choice is never silently overridden by a later OS change.
 *
 * New users default to 'system' (per product decision) — this module
 * never invents that default itself, though; see
 * services/themePreferenceService.js for where the stored/default value
 * actually comes from. This file only ever resolves+applies whatever
 * preference it's given.
 */

let mediaQueryList = null;
let mediaQueryListener = null;

function stopWatchingSystemPreference() {
  if (mediaQueryList && mediaQueryListener) {
    mediaQueryList.removeEventListener('change', mediaQueryListener);
  }
  mediaQueryList = null;
  mediaQueryListener = null;
}

function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setAppliedTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Applies a stored preference immediately, and — only for 'system' —
 * keeps watching the OS-level setting so the applied theme stays in
 * sync without a reload. Call this every time the preference changes,
 * not just once at startup; it always tears down any previous watcher
 * before deciding whether to start a new one.
 */
export function applyThemePreference(preference) {
  stopWatchingSystemPreference();

  if (preference === 'dark') {
    setAppliedTheme('dark');
    return;
  }

  if (preference === 'light') {
    setAppliedTheme('light');
    return;
  }

  // 'system' (or anything unrecognized — fails safe to system, matching
  // the default a brand-new user gets).
  setAppliedTheme(getSystemPrefersDark() ? 'dark' : 'light');

  if (window.matchMedia) {
    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryListener = (event) => setAppliedTheme(event.matches ? 'dark' : 'light');
    mediaQueryList.addEventListener('change', mediaQueryListener);
  }
}
