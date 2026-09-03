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
  Tag,
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

  const hasPurchasePrice = Boolean(product.purchase_price && product.purchase_price > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Barang"
      subtitle="Informasi spesifikasi dan harga resmi toko"
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title & Metadata Header */}
        <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E5E2DA]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#75726B] uppercase tracking-wider block">
                {product.category?.name || 'Katalog Barang'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#121214] leading-snug mt-0.5">
                {product.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="version">v{product.current_price_version}</Badge>
              {product.unit && (
                <Badge variant="neutral">{product.unit.symbol}</Badge>
              )}
            </div>
          </div>

          {product.sku && (
            <div className="mt-2 text-xs font-mono text-[#75726B] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>SKU: {product.sku}</span>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        {hasPurchasePrice ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E5E2DA] bg-white">
              <span className="text-[10px] uppercase font-bold text-[#75726B] flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-[#85827B]" />
                Harga Modal
              </span>
              <div className="text-base font-bold text-[#121214]">
                {formatRupiah(product.purchase_price)}
              </div>
              <span className="text-[10px] text-[#75726B]">per {product.unit?.symbol || 'satuan'}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] uppercase font-bold text-emerald-900 flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                Harga Jual Resmi
              </span>
              <div className="text-base font-extrabold text-emerald-800">
                {formatRupiah(product.selling_price)}
              </div>
              <span className="text-[10px] text-emerald-700">per {product.unit?.symbol || 'satuan'}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 block mb-0.5">
                Harga Jual Resmi
              </span>
              <div className="text-xl font-black font-mono text-emerald-900">
                {formatRupiah(product.selling_price)}
              </div>
            </div>
            <span className="text-xs text-emerald-800 font-medium">per {product.unit?.symbol || 'satuan'}</span>
          </div>
        )}

        {/* Stock */}
        <div className="p-3.5 rounded-xl border border-[#E5E2DA] bg-white">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#605D57] flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-[#85827B]" />
              Stok Sistem
            </span>
            <span className="font-mono text-sm font-bold text-[#121214]">
              {product.stock} {product.unit?.symbol}
            </span>
          </div>
        </div>

        {/* Notes */}
        {product.notes && (
          <div className="p-3.5 rounded-xl border border-[#E5E2DA] bg-[#FAF9F5]">
            <span className="text-[10px] font-bold uppercase text-[#75726B] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5" />
              Catatan
            </span>
            <p className="text-xs text-[#33312E] leading-relaxed">
              {product.notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-[#85827B] font-mono pt-1">
          <span>Terdaftar: {formatDate(product.created_at)}</span>
          <span>Update: {formatDate(product.updated_at)}</span>
        </div>
      </div>
    </Modal>
  );
};
