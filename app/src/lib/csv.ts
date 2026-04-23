export function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map(row => columns.map(c => escape(row[c])).join(',')).join('\n');
  return header + '\n' + body;
}

export function downloadCSV(filename: string, content: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Arabic in Excel
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
