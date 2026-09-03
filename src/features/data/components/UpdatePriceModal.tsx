import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { formatRupiah } from '../../../utils/currency';
import { getPriceChangeType, getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { updateProductPrice } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface UpdatePriceModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdatePriceModal: React.FC<UpdatePriceModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useAppStore();

  const [newPurchasePrice, setNewPurchasePrice] = useState<number>(0);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setNewPurchasePrice(product.purchase_price);
      setNewSellingPrice(product.selling_price);
      setReason('');
      setIsConfirmStep(false);
      setError(null);
    }
  }, [product]);

  if (!product) return null;

  const currentVersion = product.current_price_version;
  const nextVersion = currentVersion + 1;

  const sellingChangeType = getPriceChangeType(product.selling_price, newSellingPrice);
  const sellingVisuals = getPriceChangeVisuals(sellingChangeType);

  const purchaseChangeType = getPriceChangeType(product.purchase_price, newPurchasePrice);
  const purchaseVisuals = getPriceChangeVisuals(purchaseChangeType);

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan perubahan harga wajib diisi untuk pencatatan audit');
      return;
    }
    if (newSellingPrice <= 0) {
      setError('Harga jual baru harus lebih besar dari Rp 0');
      return;
    }
    if (
      newSellingPrice === product.selling_price &&
      newPurchasePrice === product.purchase_price
    ) {
      setError('Harga baru sama dengan harga saat ini. Tidak ada perubahan yang perlu diperbarui.');
      return;
    }

    setError(null);
    setIsConfirmStep(true);
  };

  const handleExecuteUpdate = async () => {
    try {
      setIsSubmitting(true);
      await updateProductPrice(product.id, {
        new_purchase_price: newPurchasePrice,
        new_selling_price: newSellingPrice,
        reason: reason.trim(),
      });
      showToast(
        `Harga "${product.name}" resmi diperbarui ke versi v${nextVersion}`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui harga', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isConfirmStep ? 'Konfirmasi Pembaruan Harga Resmi' : 'Pembaruan Harga Resmi'}
      subtitle={`Tindakan resmi yang akan menaikkan versi harga (v${currentVersion} → v${nextVersion})`}
      maxWidth="md"
      footer={
        isConfirmStep ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmStep(false)}
              disabled={isSubmitting}
            >
              Kembali Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteUpdate}
              isLoading={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Sah-kan Harga Baru (v{nextVersion})
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button variant="secondary" size="sm" onClick={handleProceedToConfirm}>
              Tinjau Perubahan →
            </Button>
          </>
        )
      }
    >
      {!isConfirmStep ? (
        <form onSubmit={handleProceedToConfirm} className="space-y-4">
          {/* Header Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                {product.category?.name}
              </span>
              <h4 className="text-sm font-bold truncate max-w-xs">{product.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Status Versi</span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                v{currentVersion} → v{nextVersion}
              </span>
            </div>
          </div>

          {/* New Price Inputs */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Harga Modal (Admin)</label>
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  Saat ini: {formatRupiah(product.purchase_price)}
                </span>
              </div>
              <Input
                type="number"
                prefixText="Rp"
                value={newPurchasePrice}
                onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Harga Jual Resmi</label>
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  Saat ini: {formatRupiah(product.selling_price)}
                </span>
              </div>
              <Input
                type="number"
                prefixText="Rp"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                required
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">Perubahan Jual:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${sellingVisuals.badgeClass}`}>
                  {sellingVisuals.label} ({formatRupiah(newSellingPrice - product.selling_price)})
                </span>
              </div>
            </div>

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Perubahan Harga <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Contoh: Harga supplier naik per 1 September / Diskon promo pabrik"
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </form>
      ) : (
        /* Confirmation step strictly demonstrating old vs new per PRD Section 10 & 55 */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Peringatan Pembaruan Resmi:</strong> Pembaruan harga ini akan langsung dicatat permanen di <strong>Riwayat Harga</strong>, menaikkan <strong>Price Version ke v{nextVersion}</strong>, dan menyiapkan alert perubahan harga untuk dashboard User.
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-500 pb-2 border-b border-slate-100">
              {product.name}
            </div>

            {/* Selling Price Diff */}
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-xs text-slate-500 font-medium">Harga Jual:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  {formatRupiah(product.selling_price)}
                </span>
                <span className="text-slate-400">→</span>
                <span className={`font-black ${sellingVisuals.textClass}`}>
                  {formatRupiah(newSellingPrice)}
                </span>
              </div>
            </div>

            {/* Modal Price Diff */}
            <div className="flex items-center justify-between text-sm py-1 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Harga Modal:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  {formatRupiah(product.purchase_price)}
                </span>
                <span className="text-slate-400">→</span>
                <span className={`font-bold ${purchaseVisuals.textClass}`}>
                  {formatRupiah(newPurchasePrice)}
                </span>
              </div>
            </div>

            {/* Version Diff */}
            <div className="flex items-center justify-between text-sm py-1 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Price Version:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                v{currentVersion} → v{nextVersion}
              </span>
            </div>

            {/* Reason */}
            <div className="text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium block">Alasan:</span>
              <span className="text-slate-800 font-semibold italic mt-0.5 block">
                "{reason}"
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
