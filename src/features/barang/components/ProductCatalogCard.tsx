import React from 'react';
import type { Product } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { Badge } from '../../../components/common/Badge';
import { Eye, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface ProductCatalogCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCatalogCard: React.FC<ProductCatalogCardProps> = ({
  product,
  onSelect,
}) => {
  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock =
    Number(product.stock) > 0 && Number(product.stock) <= Number(product.minimum_stock);

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
    >
      <div>
        {/* Top Header: Category & Price Version */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {product.category?.name || 'Kategori'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="version">v{product.current_price_version}</Badge>
            {product.unit && (
              <Badge variant="neutral">{product.unit.symbol}</Badge>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {product.name}
        </h3>
        {product.sku && (
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            SKU: {product.sku}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
        {/* Prices: Modal & Jual (Admin visibility - BR-12) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">
              Harga Modal
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {formatRupiah(product.purchase_price)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">
              Harga Jual
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {formatRupiah(product.selling_price)}
            </span>
          </div>
        </div>

        {/* Stock Status & Tap to view */}
        <div className="flex items-center justify-between mt-1 text-xs">
          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                <XCircle className="w-3.5 h-3.5" /> Habis (0 {product.unit?.symbol})
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" /> Menipis ({product.stock} {product.unit?.symbol})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {product.stock} {product.unit?.symbol}
              </span>
            )}
          </div>

          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Detail
          </span>
        </div>
      </div>
    </div>
  );
};
