import React, { useState } from 'react';
import type { Product } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { deactivateProduct } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { AlertTriangle } from 'lucide-react';

interface DeactivateModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeactivateModal: React.FC<DeactivateModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await deactivateProduct(product.id);
      showToast(`Barang "${product.name}" berhasil dinonaktifkan`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal menonaktifkan barang', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nonaktifkan Barang"
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeactivate}
            isLoading={loading}
          >
            Ya, Nonaktifkan
          </Button>
        </>
      }
    >
      <div className="space-y-3 font-sans">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            Apakah Anda yakin ingin menonaktifkan <strong>{product.name}</strong>?
          </div>
        </div>

        <p className="text-xs text-[#75726B] leading-relaxed">
          Barang yang dinonaktifkan akan disembunyikan dari katalog operasional tanpa menghapus riwayat pemeriksaan atau perubahan harga yang telah ada.
        </p>
      </div>
    </Modal>
  );
};
