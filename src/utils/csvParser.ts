/**
 * Safe client-side CSV parser supporting quoted strings and delimiters.
 */

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r\n|\n|\r/);
  const rows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (insideQuote && line[c + 1] === '"') {
          entry += '"';
          c++; // skip next quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  // Header row
  const headers = rows[0].map((h) => h.toLowerCase().replace(/[\s-]+/g, '_'));
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const values = rows[r];
    // Ignore entirely empty rows
    if (values.every((v) => v === '')) continue;

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index] : '';
    });
    results.push(record);
  }

  return results;
}
