/**
 * config/groupColorConfig.js
 *
 * Default colours offered for a Team ("group"). Deliberately excludes
 * red, yellow, and green — those are reserved for Learning Buckets (see
 * config/bucketConfig.js) so a group's colour is never mistaken for a
 * student's bucket. Teachers can change a group's colour at any time
 * (Setup Wizard Step 3, or Settings > Groups later).
 */

export const DEFAULT_GROUP_COLORS = Object.freeze([
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { id: 'orange', label: 'Orange', hex: '#F97316' },
  { id: 'teal', label: 'Teal', hex: '#14B8A6' },
]);

/** Cycles through DEFAULT_GROUP_COLORS by index, for auto-assigning new teams. */
export function getDefaultGroupColor(index) {
  return DEFAULT_GROUP_COLORS[index % DEFAULT_GROUP_COLORS.length].id;
}

export function getGroupColorHex(colorId) {
  const found = DEFAULT_GROUP_COLORS.find((color) => color.id === colorId);
  return found ? found.hex : '#94a3b8';
}
