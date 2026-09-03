import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, getPriceHistory } from '../../../lib/db';
import type { Product, Category, PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import {
  Search,
  Package,
  X,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

export const BarangPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Detail Modal (Strictly View Only per PRD Section 17-19)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const [prods, cats, history] = await Promise.all([
          getProducts({ includeInactive: false }),
          getCategories(),
          getPriceHistory(),
        ]);
        setProducts(prods);
        setCategories(cats);
        setPriceHistory(history);
      } catch (err) {
        console.error('Failed to load admin catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Map product id to its latest price history record (for price change diff)
  const latestPriceMap = useMemo(() => {
    const map = new Map<string, PriceHistory>();
    for (const h of priceHistory) {
      if (!map.has(h.product_id)) {
        map.set(h.product_id, h);
      }
    }
    return map;
  }, [priceHistory]);

  // Client-side search & category filtering
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category_id === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  const selectedProductHistory = selectedProduct ? latestPriceMap.get(selectedProduct.id) : null;

  return (
    <div className="space-y-6 pb-6 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Katalog Master Produk
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
            Daftar Barang
          </h1>
          <p className="text-xs text-[#75726B]">
            Melihat katalog barang, harga modal, harga jual resmi, dan stok sistem (View Only)
          </p>
        </div>
        <div className="text-xs font-mono text-[#75726B]">
          Total: <strong>{products.length}</strong> barang
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-3.5 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#85827B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang atau kode SKU..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-md border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#121214]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#121214] text-white shadow-2xs'
                : 'bg-[#F5F4EE] text-[#605D57] hover:bg-[#EAE8E2]'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#121214] text-white shadow-2xs'
                  : 'bg-[#F5F4EE] text-[#605D57] hover:bg-[#EAE8E2]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="p-8 bg-white rounded-xl border border-[#E5E2DA] text-center text-xs text-[#75726B]">
          Memuat katalog barang...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-10 text-center space-y-2">
          <Package className="w-8 h-8 text-[#85827B] mx-auto" />
          <p className="text-xs font-medium text-[#75726B]">Tidak ada barang yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const hist = latestPriceMap.get(product.id);
            const isPriceChanged = hist && (hist.change_type === 'INCREASE' || hist.change_type === 'DECREASE');
            const visuals = hist ? getPriceChangeVisuals(hist.change_type) : null;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl border border-[#E5E2DA] p-4 shadow-2xs hover:border-[#C4C0B6] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#121214] leading-snug">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F4EE] text-[#605D57]">
                          v{product.current_price_version || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#75726B] mt-0.5">
                        {product.category?.name} · {product.unit?.symbol}
                      </p>
                    </div>
                    {product.sku && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F5F4EE] text-[#605D57] border border-[#E5E2DA] shrink-0">
                        {product.sku}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Stock Grid for Admin */}
                <div className="mt-3 pt-3 border-t border-[#EAE8E2] flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-[#75726B] font-mono">
                      Modal: <strong className="text-[#121214]">{formatRupiah(product.purchase_price)}</strong>
                    </div>

                    <div className="mt-0.5">
                      {isPriceChanged && visuals ? (
                        <div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className={OLD_PRICE_CLASS}>
                              {formatRupiah(hist.old_selling_price)}
                            </span>
                            <span className="text-[#85827B]">→</span>
                            <span className={`font-bold font-mono text-sm ${visuals.textClass}`}>
                              {formatRupiah(product.selling_price)}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${visuals.badgeClass}`}>
                            {visuals.label}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm font-bold font-mono text-[#121214]">
                          Jual: {formatRupiah(product.selling_price)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock tag */}
                  <div className="text-right">
                    <span className="text-[10px] text-[#85827B] block">Stok Sistem</span>
                    <span className="text-xs font-bold font-mono text-[#121214]">
                      {product.stock} {product.unit?.symbol}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal (Strictly View Only per PRD Section 17-19) */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          subtitle={`Kategori: ${selectedProduct.category?.name || '-'} · SKU: ${selectedProduct.sku || '-'}`}
          maxWidth="md"
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProduct(null)}
              className="w-full"
            >
              Tutup
            </Button>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Price section (Admin sees both Modal & Jual) */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2DA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#75726B] block">
                  Informasi Harga Resmi
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E2DA] text-[#605D57]">
                  Versi Harga: v{selectedProduct.current_price_version || 1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-[#75726B] block">Harga Modal</span>
                  <span className="text-lg font-bold font-mono text-[#121214]">
                    {formatRupiah(selectedProduct.purchase_price)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#75726B] block">Harga Jual Resmi</span>
                  {selectedProductHistory &&
                  (selectedProductHistory.change_type === 'INCREASE' ||
                    selectedProductHistory.change_type === 'DECREASE') ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs line-through text-[#85827B] font-mono">
                          {formatRupiah(selectedProductHistory.old_selling_price)}
                        </span>
                        <span className="text-[#85827B]">→</span>
                        <span
                          className={`text-lg font-black font-mono ${
                            selectedProductHistory.change_type === 'INCREASE'
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {formatRupiah(selectedProduct.selling_price)}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border inline-flex items-center gap-1 ${
                          selectedProductHistory.change_type === 'INCREASE'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {selectedProductHistory.change_type === 'INCREASE' ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        <span>
                          {selectedProductHistory.change_type === 'INCREASE' ? 'Naik' : 'Turun'}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold font-mono text-[#121214]">
                      {formatRupiah(selectedProduct.selling_price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* General specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#E5E2DA] bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#85827B] block">
                  Stok Sistem
                </span>
                <strong className="text-sm font-mono text-[#121214]">
                  {selectedProduct.stock} {selectedProduct.unit?.symbol}
                </strong>
              </div>

              <div className="p-3 rounded-lg border border-[#E5E2DA] bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#85827B] block">
                  Batas Min. Stok
                </span>
                <strong className="text-sm font-mono text-[#121214]">
                  {selectedProduct.minimum_stock} {selectedProduct.unit?.symbol}
                </strong>
              </div>

              <div className="p-3 rounded-lg border border-[#E5E2DA] bg-white space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#85827B] block">
                  Status
                </span>
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedProduct.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            {/* View Only notice per PRD Section 17 & 19 */}
            <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E5E2DA] text-[#605D57] flex items-start gap-2 text-[11px]">
              <Info className="w-4 h-4 text-[#75726B] shrink-0 mt-0.5" />
              <span>
                Halaman ini bersifat <strong>Lihat (View Only)</strong>. Untuk mengedit nama barang, kategori, satuan, jadwal pemeriksaan, atau memperbarui harga resmi (v1→v2), silakan buka menu <strong>Data</strong>.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
