/**
 * ui/components/SpectrumColorPicker.js
 *
 * A real 2D gradient color picker (a hue-tinted saturation/value square
 * with a marker dot, plus a separate hue strip) — per explicit
 * direction, this is what "spectrum color picker" means: an inline
 * visual control, not the browser's native OS color dialog that
 * `<input type="color">` opens.
 *
 * Built with plain CSS gradients (no canvas needed): the square's
 * background is the hue color; a white-to-transparent gradient (left
 * to right) provides the saturation axis, and a black-to-transparent
 * gradient (bottom to top) provides the value axis, layered on top of
 * each other. Dragging uses Pointer Events, matching the same drag
 * pattern already established in ClassModeStudentRow.js.
 */

function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (channel) => Math.round((channel + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

export function createSpectrumColorPicker({ initialHex, onChange, onChangeComplete }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'spectrum-picker';

  const initial = hexToHsv(initialHex || '#5ea6da');
  let hue = initial.h;
  let sat = initial.s;
  let val = initial.v;

  const square = document.createElement('div');
  square.className = 'spectrum-picker__square';

  const marker = document.createElement('div');
  marker.className = 'spectrum-picker__marker';
  square.appendChild(marker);

  const hueSlider = document.createElement('div');
  hueSlider.className = 'spectrum-picker__hue-slider';
  const hueHandle = document.createElement('div');
  hueHandle.className = 'spectrum-picker__hue-handle';
  hueSlider.appendChild(hueHandle);

  function updateSquareBackground() {
    square.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
  }

  function updateMarkerPosition() {
    marker.style.left = `${sat}%`;
    marker.style.top = `${100 - val}%`;
  }

  function updateHueHandlePosition() {
    hueHandle.style.left = `${(hue / 360) * 100}%`;
  }

  function currentHex() {
    return hsvToHex(hue, sat, val);
  }

  function handleSquarePoint(clientX, clientY) {
    const rect = square.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    sat = x * 100;
    val = (1 - y) * 100;
    updateMarkerPosition();
    onChange(currentHex());
  }

  function handleHuePoint(clientX) {
    const rect = hueSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    hue = x * 360;
    updateSquareBackground();
    updateHueHandlePosition();
    onChange(currentHex());
  }

  let draggingSquare = false;
  square.addEventListener('pointerdown', (event) => {
    draggingSquare = true;
    try {
      square.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture isn't available in every environment; harmless to skip.
    }
    handleSquarePoint(event.clientX, event.clientY);
  });
  square.addEventListener('pointermove', (event) => {
    if (!draggingSquare) return;
    handleSquarePoint(event.clientX, event.clientY);
  });
  square.addEventListener('pointerup', () => {
    draggingSquare = false;
    onChangeComplete?.(currentHex());
  });

  let draggingHue = false;
  hueSlider.addEventListener('pointerdown', (event) => {
    draggingHue = true;
    try {
      hueSlider.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture isn't available in every environment; harmless to skip.
    }
    handleHuePoint(event.clientX);
  });
  hueSlider.addEventListener('pointermove', (event) => {
    if (!draggingHue) return;
    handleHuePoint(event.clientX);
  });
  hueSlider.addEventListener('pointerup', () => {
    draggingHue = false;
    onChangeComplete?.(currentHex());
  });

  updateSquareBackground();
  updateMarkerPosition();
  updateHueHandlePosition();

  wrapper.append(square, hueSlider);
  return wrapper;
}
