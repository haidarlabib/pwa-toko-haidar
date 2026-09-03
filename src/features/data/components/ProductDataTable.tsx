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
    <div className="bg-white rounded-xl border border-[#E5E2DA] shadow-2xs overflow-hidden font-sans">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF9F5] border-b border-[#EAE8E2] text-xs font-bold uppercase tracking-wider text-[#75726B] select-none">
            <tr>
              <th className="px-4 py-3">Nama Barang</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Harga Modal</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-center">Versi</th>
              <th className="px-4 py-3 text-right">Stok</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE8E2]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-[#121214]">{p.name}</div>
                  {p.sku && (
                    <div className="text-[11px] font-mono text-[#75726B] mt-0.5">
                      SKU: {p.sku}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#605D57] font-medium">
                    {p.category?.name || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#605D57] text-xs font-mono">
                  {formatRupiah(p.purchase_price)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-800 text-xs font-mono">
                  {formatRupiah(p.selling_price)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="version">v{p.current_price_version}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-bold text-[#121214]">
                  {p.stock} {p.unit?.symbol}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D5D2C9] bg-white text-[#121214] hover:bg-[#FAF9F5] transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Edit data barang"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onUpdatePrice(p)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#121214] hover:bg-[#2A2A2E] text-white shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Update harga resmi toko"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Update Harga</span>
                    </button>

                    <button
                      onClick={() => onDeactivate(p)}
                      className="p-1 text-xs text-[#85827B] hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
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
      <div className="lg:hidden divide-y divide-[#EAE8E2]">
        {products.map((p) => (
          <div key={p.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#75726B]">
                  {p.category?.name || 'Kategori'}
                </span>
                <h4 className="text-sm font-bold text-[#121214] leading-snug">{p.name}</h4>
                {p.sku && (
                  <span className="text-[11px] font-mono text-[#75726B] flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3" /> {p.sku}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="version">v{p.current_price_version}</Badge>
                <span className="text-xs font-mono font-bold text-[#121214]">
                  {p.stock} {p.unit?.symbol}
                </span>
              </div>
            </div>

            {/* Pricing info */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF9F5] p-2.5 rounded-lg text-xs border border-[#E5E2DA]">
              <div>
                <span className="text-[10px] text-[#75726B] font-bold block">HARGA MODAL</span>
                <span className="font-semibold text-[#605D57] font-mono">{formatRupiah(p.purchase_price)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-900 font-bold block">HARGA JUAL</span>
                <span className="font-bold text-emerald-800 font-mono">{formatRupiah(p.selling_price)}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[#D5D2C9] bg-white text-[#121214] hover:bg-[#FAF9F5] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onUpdatePrice(p)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#121214] text-white hover:bg-[#2A2A2E] inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Update Harga
                </button>
              </div>

              <button
                onClick={() => onDeactivate(p)}
                className="p-1.5 rounded-md text-[#85827B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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
