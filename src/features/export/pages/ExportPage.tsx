import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/common/Button';
import {
  getProducts,
  getPriceHistory,
  getStockChecks,
  getActivityLogs,
  getEditRequests,
} from '../../../lib/db';
import { formatRupiah } from '../../../utils/currency';
import { formatDateTime } from '../../../lib/datetime';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPdf';
import { useAppStore } from '../../../stores/appStore';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

type DatasetType =
  | 'products'
  | 'prices'
  | 'stock'
  | 'schedules'
  | 'price_history'
  | 'stock_checks'
  | 'edit_requests'
  | 'activity_logs';

interface ColumnDef {
  key: string;
  label: string;
}

const DATASET_COLUMNS: Record<DatasetType, ColumnDef[]> = {
  products: [
    { key: 'name', label: 'Nama Barang' },
    { key: 'sku', label: 'SKU' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'subcategory', label: 'Subkategori' },
    { key: 'unit_name', label: 'Satuan' },
    { key: 'purchase_price_fmt', label: 'Harga Modal (Rp)' },
    { key: 'selling_price_fmt', label: 'Harga Jual (Rp)' },
    { key: 'version_fmt', label: 'Price Version' },
    { key: 'stock_fmt', label: 'Stok Sistem' },
    { key: 'min_stock_fmt', label: 'Min Stok' },
    { key: 'notes', label: 'Catatan' },
  ],
  prices: [
    { key: 'name', label: 'Nama Barang' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'unit_name', label: 'Satuan' },
    { key: 'purchase_price_fmt', label: 'Harga Modal' },
    { key: 'selling_price_fmt', label: 'Harga Jual' },
    { key: 'version_fmt', label: 'Versi Harga' },
  ],
  stock: [
    { key: 'name', label: 'Nama Barang' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'unit_name', label: 'Satuan' },
    { key: 'stock', label: 'Stok Saat Ini' },
    { key: 'minimum_stock', label: 'Batas Minimum' },
    { key: 'status', label: 'Status Ketersediaan' },
  ],
  schedules: [
    { key: 'name', label: 'Nama Barang' },
    { key: 'inspection_days_fmt', label: 'Hari Pemeriksaan' },
    { key: 'status_label', label: 'Status Barang' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'stock_fmt', label: 'Stok Sistem' },
  ],
  price_history: [
    { key: 'date_fmt', label: 'Tanggal' },
    { key: 'product_name', label: 'Nama Barang' },
    { key: 'version_trans', label: 'Versi' },
    { key: 'old_selling_fmt', label: 'Harga Lama' },
    { key: 'new_selling_fmt', label: 'Harga Baru' },
    { key: 'change_label', label: 'Perubahan' },
    { key: 'reason', label: 'Alasan' },
    { key: 'admin_name', label: 'Admin' },
  ],
  stock_checks: [
    { key: 'date_fmt', label: 'Tanggal' },
    { key: 'product_name', label: 'Nama Barang' },
    { key: 'user_name', label: 'User Staf' },
    { key: 'previous_stock', label: 'Stok Sebelumnya (Teks)' },
    { key: 'current_stock', label: 'Stok Sekarang (Teks)' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Catatan Staf' },
  ],
  edit_requests: [
    { key: 'date_fmt', label: 'Waktu Pengajuan' },
    { key: 'product_name', label: 'Nama Barang' },
    { key: 'requested_by', label: 'Pemohon' },
    { key: 'reason', label: 'Alasan' },
    { key: 'status', label: 'Status Putusan' },
    { key: 'reviewed_by', label: 'Reviewer' },
  ],
  activity_logs: [
    { key: 'date_fmt', label: 'Waktu' },
    { key: 'user_name', label: 'User' },
    { key: 'action', label: 'Tindakan' },
    { key: 'entity_type', label: 'Entitas' },
    { key: 'description', label: 'Keterangan' },
  ],
};

export const ExportPage: React.FC = () => {
  const { showToast } = useAppStore();

  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('products');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Raw data from DB
  const [products, setProducts] = useState<any[]>([]);
  const [priceHistories, setPriceHistories] = useState<any[]>([]);
  const [stockChecks, setStockChecks] = useState<any[]>([]);
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, hist, checks, reqs, logs] = await Promise.all([
          getProducts({ includeInactive: true }),
          getPriceHistory(),
          getStockChecks(),
          getEditRequests(),
          getActivityLogs(),
        ]);
        setProducts(prods);
        setPriceHistories(hist);
        setStockChecks(checks);
        setEditRequests(reqs);
        setActivityLogs(logs);
      } catch (err) {
        console.error('Failed to load export data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Set default columns on dataset change
  useEffect(() => {
    const defaultCols = DATASET_COLUMNS[selectedDataset].map((c) => c.key);
    setSelectedColumnKeys(defaultCols);
  }, [selectedDataset]);

  // Preset Handlers
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'Barang Lengkap':
        setSelectedDataset('products');
        setSelectedColumnKeys([
          'name',
          'sku',
          'category_name',
          'unit_name',
          'purchase_price_fmt',
          'selling_price_fmt',
          'stock_fmt',
        ]);
        break;

      case 'Harga Modal + Jual':
        setSelectedDataset('prices');
        setSelectedColumnKeys([
          'name',
          'category_name',
          'purchase_price_fmt',
          'selling_price_fmt',
          'version_fmt',
        ]);
        break;

      case 'Harga Jual':
        setSelectedDataset('prices');
        setSelectedColumnKeys(['name', 'category_name', 'selling_price_fmt', 'version_fmt']);
        break;

      case 'Stok':
        setSelectedDataset('stock');
        setSelectedColumnKeys(['name', 'unit_name', 'stock', 'status']);
        break;

      case 'Jadwal Pemeriksaan':
        setSelectedDataset('schedules');
        setSelectedColumnKeys(['name', 'inspection_days_fmt', 'status_label', 'category_name']);
        break;

      case 'Riwayat Harga':
        setSelectedDataset('price_history');
        setSelectedColumnKeys([
          'date_fmt',
          'product_name',
          'version_trans',
          'old_selling_fmt',
          'new_selling_fmt',
          'change_label',
          'admin_name',
          'reason',
        ]);
        break;

      case 'Pemeriksaan Stok':
        setSelectedDataset('stock_checks');
        setSelectedColumnKeys([
          'date_fmt',
          'product_name',
          'user_name',
          'previous_stock',
          'current_stock',
          'status',
          'note',
        ]);
        break;

      case 'Request Edit':
        setSelectedDataset('edit_requests');
        setSelectedColumnKeys([
          'date_fmt',
          'product_name',
          'requested_by',
          'reason',
          'status',
          'reviewed_by',
        ]);
        break;
    }
  };

  // Format active dataset records for table & export
  const activeDatasetFormatted: Record<string, any>[] = useMemo(() => {
    switch (selectedDataset) {
      case 'products':
      case 'prices':
        return products.map((p) => ({
          name: p.name,
          sku: p.sku || '-',
          category_name: p.category?.name || 'Tanpa Kategori',
          subcategory: p.subcategory || '-',
          unit_name: p.unit?.name ? `${p.unit.name} (${p.unit.symbol})` : 'PCS',
          purchase_price_fmt: formatRupiah(p.purchase_price),
          selling_price_fmt: formatRupiah(p.selling_price),
          version_fmt: `v${p.current_price_version}`,
          stock_fmt: `${p.stock} ${p.unit?.symbol || ''}`,
          min_stock_fmt: `${p.minimum_stock} ${p.unit?.symbol || ''}`,
          notes: p.notes || '-',
        }));

      case 'stock':
        return products.map((p) => ({
          name: p.name,
          category_name: p.category?.name || 'Tanpa Kategori',
          unit_name: p.unit?.symbol || 'PCS',
          stock: p.stock,
          minimum_stock: p.minimum_stock,
          status:
            p.stock <= 0
              ? 'HABIS'
              : p.stock <= p.minimum_stock
              ? 'MENIPIS'
              : 'TERSEDIA',
        }));

      case 'schedules':
        return products.map((p) => ({
          name: p.name,
          inspection_days_fmt: p.inspection_days && p.inspection_days.length > 0
            ? p.inspection_days.join(', ')
            : 'Belum dijadwalkan',
          status_label: p.is_active ? 'Aktif' : 'Nonaktif',
          category_name: p.category?.name || '-',
          stock_fmt: `${p.stock} ${p.unit?.symbol || ''}`,
        }));

      case 'price_history':
        return priceHistories.map((h) => ({
          date_fmt: formatDateTime(h.created_at),
          product_name: h.product_name || 'Barang',
          version_trans: `v${h.version}`,
          old_selling_fmt: formatRupiah(h.old_selling_price),
          new_selling_fmt: formatRupiah(h.new_selling_price),
          change_label:
            h.change_type === 'INCREASE'
              ? 'NAIK'
              : h.change_type === 'DECREASE'
              ? 'TURUN'
              : 'TETAP',
          reason: h.reason,
          admin_name: h.updated_by_name || 'Admin',
        }));

      case 'stock_checks':
        return stockChecks.map((s) => ({
          date_fmt: formatDateTime(s.created_at),
          product_name: s.product_name || 'Barang',
          user_name: s.user_name || 'Staff',
          previous_stock: s.previous_stock, // Preserves exact raw text
          current_stock: s.current_stock,   // Preserves exact raw text
          status: s.status || 'SUBMITTED',
          note: s.note || '-',
        }));

      case 'edit_requests':
        return editRequests.map((r) => ({
          date_fmt: formatDateTime(r.created_at),
          product_name: r.product_name || 'Barang',
          requested_by: r.requested_by,
          reason: r.reason,
          status: r.status,
          reviewed_by: r.reviewed_by || '-',
        }));

      case 'activity_logs':
        return activityLogs.map((l) => ({
          date_fmt: formatDateTime(l.created_at),
          user_name: l.user_name,
          action: l.action,
          entity_type: l.entity_type,
          description: l.description,
        }));

      default:
        return [];
    }
  }, [selectedDataset, products, priceHistories, stockChecks, editRequests, activityLogs]);

  // Toggle single column
  const toggleColumn = (key: string) => {
    if (selectedColumnKeys.includes(key)) {
      if (selectedColumnKeys.length === 1) {
        showToast('Minimal 1 kolom harus dipilih untuk diekspor', 'error');
        return;
      }
      setSelectedColumnKeys(selectedColumnKeys.filter((k) => k !== key));
    } else {
      setSelectedColumnKeys([...selectedColumnKeys, key]);
    }
  };

  // Active columns def
  const activeColumns = useMemo(() => {
    return DATASET_COLUMNS[selectedDataset].filter((c) =>
      selectedColumnKeys.includes(c.key)
    );
  }, [selectedDataset, selectedColumnKeys]);

  // Handle Export Action
  const handleDownload = () => {
    if (activeColumns.length === 0) {
      showToast('Pilih setidaknya 1 kolom untuk diekspor', 'error');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `HaidarPlastik_${selectedDataset}_${timestamp}`;

    if (selectedFormat === 'excel') {
      exportToExcel(
        activeDatasetFormatted,
        activeColumns,
        fileName,
        selectedDataset.toUpperCase()
      );
      showToast(`File Excel "${fileName}.xlsx" berhasil diunduh`);
    } else {
      exportToPDF(
        activeDatasetFormatted,
        activeColumns,
        fileName,
        `Laporan ${selectedDataset.replace('_', ' ').toUpperCase()}`
      );
      showToast(`Dokumen PDF "${fileName}.pdf" berhasil diunduh`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Export Data & Laporan"
        subtitle="Halaman khusus pengeluaran 8 dataset inventori dalam format Excel (.xlsx) dan PDF resmi"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Step 1: Choose Dataset (8 Datasets - PRD v2.0 Section 74) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Pilih Sumber Data (8 Dataset)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'products', label: 'Data Barang', count: products.length },
              { id: 'prices', label: 'Data Harga', count: products.length },
              { id: 'stock', label: 'Data Stok', count: products.length },
              { id: 'schedules', label: 'Jadwal Cek', count: products.length },
              { id: 'price_history', label: 'Riwayat Harga', count: priceHistories.length },
              { id: 'stock_checks', label: 'Cek Stok Staf', count: stockChecks.length },
              { id: 'edit_requests', label: 'Request Edit', count: editRequests.length },
              { id: 'activity_logs', label: 'Activity Log', count: activityLogs.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDataset(item.id as DatasetType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedDataset === item.id
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`text-xs font-bold leading-snug truncate ${
                    selectedDataset === item.id ? 'text-emerald-950' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {item.count} rekaman
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Presets & Column Picker */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Pilih Kolom & Preset Pintar
            </h3>

            {/* Presets buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500" /> Preset:
              </span>
              {[
                'Barang Lengkap',
                'Harga Modal + Jual',
                'Harga Jual',
                'Stok',
                'Jadwal Pemeriksaan',
                'Riwayat Harga',
                'Pemeriksaan Stok',
                'Request Edit',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes for columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {DATASET_COLUMNS[selectedDataset].map((col) => {
              const isChecked = selectedColumnKeys.includes(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-slate-50/40 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Choose Format & Download */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Pilih Format File
            </h3>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedFormat('excel')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFormat === 'excel'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFormat === 'pdf'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            disabled={loading}
            isLoading={loading}
            className="shadow-sm font-bold w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFormat.toUpperCase()} ({activeDatasetFormatted.length} baris)</span>
          </Button>
        </div>

        {/* Step 4: Live Data Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pratinjau Hasil Export (5 Baris Pertama)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Total {activeDatasetFormatted.length} data siap diekspor
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  {activeColumns.map((col) => (
                    <th key={col.key} className="px-4 py-2.5">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeDatasetFormatted.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    {activeColumns.map((col) => (
                      <td key={col.key} className="px-4 py-2.5 text-slate-800 font-medium">
                        {(row as Record<string, any>)[col.key] !== undefined
                          ? (row as Record<string, any>)[col.key]
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
