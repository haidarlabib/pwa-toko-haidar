import React from 'react';
import type { Product } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { formatRupiah } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import {
  Coins,
  Warehouse,
  FileText,
  AlertCircle,
  Tag,
  Info,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Barang (Katalog View-Only)"
      subtitle="Informasi spesifikasi barang dan status resmi saat ini"
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Halaman Barang hanya untuk melihat. Untuk mengedit buka menu Data.
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title & Metadata Header */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {product.category?.name || 'Kategori'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
                {product.name}
              </h3>
              {product.subcategory && (
                <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                  Subkategori: {product.subcategory}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="version">Versi {product.current_price_version}</Badge>
              <Badge variant="neutral">{product.unit?.name || 'Satuan'}</Badge>
            </div>
          </div>

          {product.sku && (
            <div className="mt-2 text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>SKU: {product.sku}</span>
            </div>
          )}
        </div>

        {/* Pricing Breakdown (Admin View per BR-12) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Harga Modal (Admin)
            </span>
            <div className="text-base font-bold text-slate-800">
              {formatRupiah(product.purchase_price)}
            </div>
            <span className="text-[10px] text-slate-400">per {product.unit?.symbol || 'satuan'}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Harga Jual Resmi
            </span>
            <div className="text-base font-extrabold text-emerald-700">
              {formatRupiah(product.selling_price)}
            </div>
            <span className="text-[10px] text-emerald-600">per {product.unit?.symbol || 'satuan'}</span>
          </div>
        </div>

        {/* System Stock & Minimum Stock */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-slate-400" />
              Stok Sistem Saat Ini
            </span>
            <span className="font-mono text-sm font-bold text-slate-900">
              {product.stock} {product.unit?.symbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Batas Stok Minimum
            </span>
            <span className="font-mono font-semibold text-slate-700">
              {product.minimum_stock} {product.unit?.symbol}
            </span>
          </div>
        </div>

        {/* Notes */}
        {product.notes && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5" />
              Catatan Operasional
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {product.notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>Terdaftar: {formatDate(product.created_at)}</span>
          <span>Update Terakhir: {formatDate(product.updated_at)}</span>
        </div>
      </div>
    </Modal>
  );
};
