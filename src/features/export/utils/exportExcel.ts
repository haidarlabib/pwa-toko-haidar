import * as XLSX from 'xlsx';

export function exportToExcel(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  fileName: string,
  sheetName: string = 'Haidar Plastik'
) {
  // Map rows according to selected columns
  const formattedRows = data.map((row) => {
    const formatted: Record<string, any> = {};
    columns.forEach((col) => {
      formatted[col.label] = row[col.key] !== undefined ? row[col.key] : '-';
    });
    return formatted;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
