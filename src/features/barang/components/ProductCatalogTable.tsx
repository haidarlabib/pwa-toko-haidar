import React from 'react';
import type { Product } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { Badge } from '../../../components/common/Badge';
import { Eye, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface ProductCatalogTableProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Satuan</th>
              <th className="px-4 py-3 text-right">Harga Modal</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-center">Versi Harga</th>
              <th className="px-4 py-3 text-right">Stok Sistem</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const isOutOfStock = Number(product.stock) <= 0;
              const isLowStock =
                Number(product.stock) > 0 &&
                Number(product.stock) <= Number(product.minimum_stock);

              return (
                <tr
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{product.name}</div>
                    {product.sku && (
                      <div className="text-[11px] font-mono text-slate-400">
                        {product.sku}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{product.unit?.symbol || '-'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-600 text-xs">
                    {formatRupiah(product.purchase_price)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 text-xs">
                    {formatRupiah(product.selling_price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="version">v{product.current_price_version}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                    {product.stock} {product.unit?.symbol}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <XCircle className="w-3 h-3" /> Habis
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Tersedia
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelect(product)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      title="Lihat Detail Barang"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
