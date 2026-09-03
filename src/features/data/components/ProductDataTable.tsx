import React from 'react';
import type { Product } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { Badge } from '../../../components/common/Badge';
import { Edit3, TrendingUp, Trash2, Tag } from 'lucide-react';

interface ProductDataTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onUpdatePrice: (product: Product) => void;
  onDeactivate: (product: Product) => void;
}

export const ProductDataTable: React.FC<ProductDataTableProps> = ({
  products,
  onEdit,
  onUpdatePrice,
  onDeactivate,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Harga Modal</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-center">Versi Harga</th>
              <th className="px-4 py-3 text-right">Stok Sistem</th>
              <th className="px-4 py-3 text-center">Aksi Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                    {p.sku && <span>SKU: {p.sku}</span>}
                    {p.subcategory && (
                      <span className="text-slate-500 font-sans">• {p.subcategory}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-700 font-medium">
                    {p.category?.name || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-600 text-xs">
                  {formatRupiah(p.purchase_price)}
                </td>
                <td className="px-4 py-3 text-right font-black text-emerald-700 text-xs">
                  {formatRupiah(p.selling_price)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="version">v{p.current_price_version}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-bold text-slate-800">
                  {p.stock} {p.unit?.symbol}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Edit Metadata Button (BR-03) */}
                    <button
                      onClick={() => onEdit(p)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all inline-flex items-center gap-1"
                      title="Edit master data (versi harga tidak berubah)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Consequential Update Price Button (BR-04) */}
                    <button
                      onClick={() => onUpdatePrice(p)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all inline-flex items-center gap-1"
                      title="Update harga resmi toko (versi harga naik +1)"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Update Harga</span>
                    </button>

                    {/* Deactivate Button (BR-15) */}
                    <button
                      onClick={() => onDeactivate(p)}
                      className="p-1 text-xs text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Nonaktifkan barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Responsive Cards */}
      <div className="lg:hidden divide-y divide-slate-100">
        {products.map((p) => (
          <div key={p.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {p.category?.name || 'Kategori'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
                {p.sku && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3" /> {p.sku}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="version">v{p.current_price_version}</Badge>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {p.stock} {p.unit?.symbol}
                </span>
              </div>
            </div>

            {/* Pricing info */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">HARGA MODAL</span>
                <span className="font-semibold text-slate-700">{formatRupiah(p.purchase_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold block">HARGA JUAL</span>
                <span className="font-black text-emerald-700">{formatRupiah(p.selling_price)}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onUpdatePrice(p)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Update Harga
                </button>
              </div>

              <button
                onClick={() => onDeactivate(p)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                title="Nonaktifkan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
