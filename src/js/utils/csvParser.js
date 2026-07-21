/**
 * utils/csvParser.js
 *
 * A small, dependency-free CSV parser: enough to handle a teacher's
 * classroom spreadsheet exported to CSV, including quoted fields that
 * contain commas. Does not support quoted fields spanning multiple lines
 * — classroom roster exports aren't expected to need that.
 *
 * Added in Sprint 1A to support the classroom import feature.
 */

export function parseCsv(text) {
  const rows = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  for (const line of lines) {
    if (line.length === 0) {
      rows.push([]);
      continue;
    }
    rows.push(parseCsvLine(line));
  }

  return rows;
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}
