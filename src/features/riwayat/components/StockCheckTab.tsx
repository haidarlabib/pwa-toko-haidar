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
  Check,
  X,
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
  const [userName, setUserName] = useState('Staf Toko');
  const [prevStockText, setPrevStockText] = useState('120 pak');
  const [currStockText, setCurrStockText] = useState('180 pcs');
  const [noteText, setNoteText] = useState('');
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
        previous_stock: prevStockText,
        current_stock: currStockText,
        note: noteText,
      });

      showToast('Laporan pemeriksaan fisik staf tersimpan', 'success');
      setIsSimulateModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pemeriksaan stok', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (checkId: string) => {
    try {
      await approveStockCheckEdit(checkId, 'Admin');
      showToast('Permintaan edit disetujui', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui edit', 'error');
    }
  };

  const handleReject = async (checkId: string) => {
    try {
      await rejectStockCheckEdit(checkId, 'Admin');
      showToast('Permintaan edit ditolak', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak edit', 'error');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Notice Banner */}
      <div className="bg-[#FAF9F5] border border-[#E5E2DA] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs text-[#605D57] leading-relaxed">
          <Info className="w-4 h-4 text-[#75726B] shrink-0 mt-0.5" />
          <div>
            Hasil pemeriksaan fisik staf adalah catatan observasi toko dan tidak mengubah angka stok sistem.
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
          <span>Simulasi Laporan</span>
        </Button>
      </div>

      {/* Checks list */}
      {checks.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-12 text-center text-xs text-[#75726B]">
          Belum ada kiriman pemeriksaan fisik dari staf.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {checks.map((check) => (
            <div
              key={check.id}
              className="bg-white rounded-xl border border-[#E5E2DA] p-4 shadow-2xs hover:border-[#C4C0B6] transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#121214]">
                    {check.product_name || 'Barang'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#75726B] font-mono mt-0.5">
                    <User className="w-3 h-3 text-[#85827B]" />
                    <span>{check.user_name || 'Staff'}</span>
                    <span>·</span>
                    <span>{formatDateTime(check.created_at)}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    check.status === 'EDIT_REQUESTED'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : check.status === 'EDIT_APPROVED'
                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                      : check.status === 'EDIT_REJECTED'
                      ? 'bg-rose-50 text-rose-900 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {check.status === 'EDIT_REQUESTED'
                    ? 'Minta Edit'
                    : check.status === 'EDIT_APPROVED'
                    ? 'Edit Disetujui'
                    : check.status === 'EDIT_REJECTED'
                    ? 'Edit Ditolak'
                    : 'Tersimpan'}
                </span>
              </div>

              {/* Textual stock diff */}
              <div className="grid grid-cols-2 gap-2 bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E5E2DA] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#75726B] block">Sebelumnya</span>
                  <span className="text-[#605D57]">"{check.previous_stock}"</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-900 font-bold block">Fisik Sekarang</span>
                  <strong className="text-[#121214]">"{check.current_stock}"</strong>
                </div>
              </div>

              {check.note && (
                <div className="text-xs text-[#605D57] bg-[#FAF9F5] p-2 rounded border border-[#E5E2DA]">
                  <span className="font-semibold text-[#121214]">Catatan: </span>
                  <span className="italic">"{check.note}"</span>
                </div>
              )}

              {/* Action buttons if requested edit */}
              {check.status === 'EDIT_REQUESTED' && (
                <div className="pt-2 border-t border-[#EAE8E2] flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-900 font-medium">Staf meminta izin revisi</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReject(check.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => handleApprove(check.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#121214] text-white hover:bg-[#2A2A2E] transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Setujui</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal simulation */}
      {isSimulateModalOpen && (
        <Modal
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
          title="Simulasi Laporan Pemeriksaan Fisik"
          maxWidth="md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsSimulateModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSimulateSubmit} isLoading={loading}>
                Simpan Hasil Cek
              </Button>
            </>
          }
        >
          <form onSubmit={handleSimulateSubmit} className="space-y-3">
            <Select
              label="Pilih Barang"
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />

            <Input
              label="Nama Pemeriksa"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stok Sebelumnya"
                value={prevStockText}
                onChange={(e) => setPrevStockText(e.target.value)}
                placeholder="120 pak"
                required
              />
              <Input
                label="Stok Sekarang"
                value={currStockText}
                onChange={(e) => setCurrStockText(e.target.value)}
                placeholder="180 pcs"
                required
              />
            </div>

            <Input
              label="Catatan Lapangan"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Keterangan tambahan..."
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
