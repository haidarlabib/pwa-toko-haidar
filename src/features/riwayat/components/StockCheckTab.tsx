import React, { useState } from 'react';
import type { StockCheck, Product } from '../../../types/database.types';
import { formatDateTime } from '../../../utils/date';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { addStockCheck, approveStockCheckEdit, rejectStockCheckEdit } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import {
  User,
  Plus,
  Info,
  MessageSquare,
} from 'lucide-react';

interface StockCheckTabProps {
  checks: StockCheck[];
  products: Product[];
  onRefresh: () => void;
}

export const StockCheckTab: React.FC<StockCheckTabProps> = ({
  checks,
  products,
  onRefresh,
}) => {
  const { showToast } = useAppStore();
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [userName, setUserName] = useState('Staff Toko A');
  const [prevStockText, setPrevStockText] = useState('120 pak');
  const [currStockText, setCurrStockText] = useState('180 pcs');
  const [noteText, setNoteText] = useState('masih ada banyak di rak belakang');
  const [loading, setLoading] = useState(false);

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !prevStockText.trim() || !currStockText.trim()) {
      showToast('Pilih barang dan masukkan teks stok pemeriksaan', 'error');
      return;
    }

    try {
      setLoading(true);
      await addStockCheck({
        product_id: selectedProductId,
        user_name: userName,
        previous_stock: prevStockText, // String preserved (BR-11, BR-22)
        current_stock: currStockText,   // String preserved (BR-11, BR-22)
        note: noteText,
      });

      showToast(
        'Laporan pemeriksaan fisik staf tersimpan. Perhatikan: Stok sistem tidak berubah otomatis (BR-10 & BR-23).',
        'success'
      );
      setIsSimulateModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pemeriksaan stok', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Rule Notice Banner (BR-10, BR-23) */}
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs text-indigo-900 leading-relaxed">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Aturan Bisnis Kritis (BR-10 & BR-23):</strong> Pemeriksaan Stok adalah pengamatan fisik tekstual dari staf (contoh: <em>"120 pak"</em>, <em>"3 dus + 20 pcs"</em>) dan <strong>TIDAK</strong> secara otomatis mengubah kuantitas stok sistem.
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (products.length > 0) setSelectedProductId(products[0].id);
            setIsSimulateModalOpen(true);
          }}
          className="shrink-0 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Simulasi Laporan Staf
        </Button>
      </div>

      {/* Checks list */}
      {checks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Belum ada kiriman pemeriksaan stok dari staf.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {checks.map((check) => (
            <div
              key={check.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {check.product_name || 'Barang'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Oleh: <strong className="text-slate-700">{check.user_name}</strong></span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDateTime(check.created_at)}
                </span>
              </div>

              {/* Exact user text observations */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans font-bold block uppercase">
                    Stok Sebelumnya (Teks)
                  </span>
                  <span className="font-semibold text-slate-700">
                    "{check.previous_stock}"
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-sans font-bold block uppercase">
                    Stok Sekarang (Teks)
                  </span>
                  <span className="font-bold text-indigo-900">
                    "{check.current_stock}"
                  </span>
                </div>
              </div>

              {check.note && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Catatan: "{check.note}"</span>
                </div>
              )}

              {/* Status and Edit Request Approval Bar (PRD Section 28) */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {check.status === 'EDIT_REQUESTED' ? (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 text-[11px] animate-pulse">
                      ⏳ Menunggu Persetujuan Edit
                    </span>
                  ) : check.status === 'EDIT_APPROVED' ? (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px]">
                      ✓ Edit Disetujui
                    </span>
                  ) : check.status === 'EDIT_REJECTED' ? (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-200 text-[11px]">
                      ✕ Edit Ditolak
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                      🔒 Terkunci
                    </span>
                  )}
                </div>

                {/* Admin Approval Actions */}
                {check.status === 'EDIT_REQUESTED' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        await approveStockCheckEdit(check.id);
                        showToast(`Permintaan edit ${check.product_name} disetujui`);
                        onRefresh();
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Setujui Edit
                    </button>
                    <button
                      onClick={async () => {
                        await rejectStockCheckEdit(check.id);
                        showToast(`Permintaan edit ${check.product_name} ditolak`, 'info');
                        onRefresh();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>

              {check.status === 'EDIT_REQUESTED' && check.edit_reason && (
                <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Alasan minta edit:</strong> "{check.edit_reason}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simulation Modal for Admin verification */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        title="Simulasi Pengiriman Pemeriksaan Stok Staf"
        subtitle="Uji coba pengiriman laporan fisik staf toko"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimulateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSimulateSubmit}
              isLoading={loading}
            >
              Kirim Laporan Fisik
            </Button>
          </>
        }
      >
        <form onSubmit={handleSimulateSubmit} className="space-y-3">
          <Select
            label="Pilih Barang yang Diperiksa"
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (Stok Sistem: ${p.stock} ${p.unit?.symbol})`,
            }))}
          />

          <Input
            label="Nama Staf Pelapor"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Stok Sebelumnya (Teks String)"
              placeholder='Contoh: "120 pak"'
              value={prevStockText}
              onChange={(e) => setPrevStockText(e.target.value)}
              required
              helperText="Format teks bebas staf"
            />
            <Input
              label="Stok Sekarang (Teks String)"
              placeholder='Contoh: "3 dus + 20 pcs"'
              value={currStockText}
              onChange={(e) => setCurrStockText(e.target.value)}
              required
              helperText="Format teks bebas staf"
            />
          </div>

          <Input
            label="Catatan Pengamatan Fisik (Opsional)"
            placeholder='Contoh: "masih ada banyak di gudang atas"'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
