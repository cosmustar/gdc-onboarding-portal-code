/**
 * Small CSV reader (no external dependency).
 * - Detects the delimiter (comma or semicolon) from the header line.
 * - Supports quoted fields with commas, line breaks and escaped quotes ("").
 * - Strips the UTF-8 BOM that Power BI / Excel add.
 */
export type CsvRow = Record<string, string>;

export interface CsvTable {
  headers: string[];
  rows: CsvRow[];
}

export function parseCsv(text: string): CsvTable {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = count(firstLine, ';') > count(firstLine, ',') ? ';' : ',';

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      record.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => r.some((v) => v.trim() !== ''));
  const headers = (nonEmpty.shift() ?? []).map((h) => h.trim());
  const rows = nonEmpty.map((r) => Object.fromEntries(headers.map((h, idx) => [h, (r[idx] ?? '').trim()])));
  return { headers, rows };
}

function count(s: string, ch: string) {
  return s.split(ch).length - 1;
}
