import React from 'react';
import type { Product } from '../../../types/database.types';
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StockAlertsProps {
  products: Product[];
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ products }) => {
  const alertItems = products.filter(
    (p) => Number(p.stock) <= Number(p.minimum_stock) && p.is_active
  );

  if (alertItems.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
          ✓
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Semua Stok Aman</h3>
          <p className="text-xs text-emerald-700">Tidak ada barang dengan stok di bawah batas minimum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
              Peringatan Stok ({alertItems.length})
            </h3>
            <p className="text-xs text-amber-700">Barang yang memerlukan restock segera</p>
          </div>
        </div>
        <Link
          to="/barang?stock=Menipis"
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
        >
          Lihat di Katalog <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
        {alertItems.map((p) => {
          const isOut = Number(p.stock) <= 0;
          return (
            <div key={p.id} className="p-3.5 sm:p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 truncate">{p.name}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {p.category?.name || 'Kategori'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Min: <span className="font-medium text-slate-700">{p.minimum_stock} {p.unit?.name || p.unit?.symbol || ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isOut ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="w-3.5 h-3.5" /> Habis (0 {p.unit?.name || p.unit?.symbol || ''})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Sisa {p.stock} {p.unit?.name || p.unit?.symbol || ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
