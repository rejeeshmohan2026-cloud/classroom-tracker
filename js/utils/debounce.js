/**
 * utils/debounce.js
 *
 * A small, generic debounce helper. Used by the Notebook Register
 * screen (see ui/views/NotebookRegisterView.js) so a burst of quick
 * clicks across a class roster fires one save shortly after the last
 * click, not one whole-document write per click.
 */

export function createDebouncedFunction(fn, delayMs) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
