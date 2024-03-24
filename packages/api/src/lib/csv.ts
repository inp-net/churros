export function toCsv<K extends readonly string[]>(
  header: K,
  data: Array<Record<K[number], string>>,
): string {
  if (data.length === 0) return '';
  return [header, ...data.map((row) => header.map((key) => row[key as K[number]] ?? ''))]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

export function toTsv<K extends readonly string[]>(
  header: K,
  data: Array<Record<K[number], string>>,
): string {
  if (data.length === 0) return '';
  return [header, ...data.map((row) => header.map((key) => row[key as K[number]] ?? ''))]
    .map((row) => row.map((cell) => cell.replaceAll('\t', ' ')).join('\t'))
    .join('\n');
}
