import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { formatRupiah } from '../../../utils/currency';
import { getPriceChangeType, getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { updateProductPrice } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { AlertCircle } from 'lucide-react';

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
    if (newSellingPrice <= 0) {
      setError('Harga jual baru harus lebih besar dari Rp 0');
      return;
    }
    if (
      newSellingPrice === product.selling_price &&
      newPurchasePrice === product.purchase_price
    ) {
      setError('Harga baru sama dengan harga saat ini.');
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
        reason: reason.trim() || undefined,
      });
      showToast(
        `Harga "${product.name}" berhasil diperbarui ke v${nextVersion}`,
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
      title={isConfirmStep ? 'Konfirmasi Harga Baru' : 'Update Harga Resmi'}
      subtitle={`Versi harga akan beralih dari v${currentVersion} ke v${nextVersion}`}
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
              Kembali
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteUpdate}
              isLoading={isSubmitting}
            >
              Terapkan Harga (v{nextVersion})
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleProceedToConfirm}>
              Tinjau Perubahan →
            </Button>
          </>
        )
      }
    >
      {!isConfirmStep ? (
        <form onSubmit={handleProceedToConfirm} className="space-y-4">
          {/* Header Card */}
          <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2DA] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#75726B] font-bold uppercase tracking-wider block">
                {product.category?.name || 'Katalog'}
              </span>
              <h4 className="text-sm font-bold text-[#121214] truncate max-w-xs">{product.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#75726B] block font-mono">Versi</span>
              <span className="font-mono text-xs font-bold text-[#121214]">
                v{currentVersion} → v{nextVersion}
              </span>
            </div>
          </div>

          {/* New Price Inputs */}
          <div className="space-y-3">
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E2DA] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#121214]">Harga Modal</label>
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

            <div className="p-3.5 bg-white rounded-xl border border-[#E5E2DA] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#121214]">Harga Jual Resmi</label>
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
              <div className="mt-2 flex items-center justify-between pt-1">
                <span className="text-xs text-[#75726B]">Perubahan Jual:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${sellingVisuals.badgeClass}`}>
                  {sellingVisuals.label} ({formatRupiah(newSellingPrice - product.selling_price)})
                </span>
              </div>
            </div>

            {/* Optional Reason */}
            <div>
              <label className="block text-xs font-bold text-[#121214] mb-1">
                Alasan Perubahan Harga
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Contoh: Penyesuaian harga supplier per September"
                className="w-full text-xs rounded-lg border border-[#D5D2C9] p-2.5 bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none placeholder-[#A8A49C]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </form>
      ) : (
        /* Confirmation step */
        <div className="space-y-4">
          <div className="bg-[#FAF9F5] border border-[#E5E2DA] rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-[#75726B] pb-2 border-b border-[#EAE8E2]">
              {product.name}
            </div>

            {/* Selling Price Diff */}
            <div className="flex items-center justify-between text-xs sm:text-sm py-1">
              <span className="text-xs text-[#75726B] font-medium">Harga Jual:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  {formatRupiah(product.selling_price)}
                </span>
                <span className="text-[#85827B]">→</span>
                <span className={`font-black font-mono ${sellingVisuals.textClass}`}>
                  {formatRupiah(newSellingPrice)}
                </span>
              </div>
            </div>

            {/* Modal Price Diff */}
            <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-t border-[#EAE8E2]">
              <span className="text-xs text-[#75726B] font-medium">Harga Modal:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${OLD_PRICE_CLASS}`}>
                  {formatRupiah(product.purchase_price)}
                </span>
                <span className="text-[#85827B]">→</span>
                <span className={`font-bold font-mono ${purchaseVisuals.textClass}`}>
                  {formatRupiah(newPurchasePrice)}
                </span>
              </div>
            </div>

            {/* Version Diff */}
            <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-t border-[#EAE8E2]">
              <span className="text-xs text-[#75726B] font-medium">Versi:</span>
              <span className="font-mono text-xs font-bold text-[#121214]">
                v{currentVersion} → v{nextVersion}
              </span>
            </div>

            {/* Reason */}
            <div className="text-xs pt-2 border-t border-[#EAE8E2]">
              <span className="text-[#75726B] font-medium block">Alasan:</span>
              {reason.trim() ? (
                <span className="text-[#121214] font-semibold italic mt-0.5 block">
                  "{reason.trim()}"
                </span>
              ) : (
                <span className="text-[#85827B] italic mt-0.5 block">
                  (Tidak diisi)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
