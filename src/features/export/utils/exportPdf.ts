import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  fileName: string,
  title: string
) {
  // Use landscape if more than 5 columns
  const orientation = columns.length > 5 ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  // Header branding
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('HAIDAR PLASTIK — LAPORAN RESMI', 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`${title} • Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

  // Prepare table headers and body
  const headers = [columns.map((c) => c.label)];
  const rows = data.map((item) =>
    columns.map((col) => {
      const val = item[col.key];
      return val !== undefined && val !== null ? String(val) : '-';
    })
  );

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 28,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${fileName}.pdf`);
}
