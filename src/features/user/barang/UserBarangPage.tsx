import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, getPriceHistory } from '../../../lib/db';
import type { Product, Category, PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
import { CategoryFilterPopover } from '../../../components/common/CategoryFilterPopover';
import { ProductDetailModal } from '../../barang/components/ProductDetailModal';
import {
  Search,
  Package,
  X,
} from 'lucide-react';

export const UserBarangPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Detail Modal
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
        console.error('Failed to load user catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Category product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

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
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  return (
    <div className="space-y-5 pb-6 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#EAE8E2] flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight">
          Daftar Barang & Harga
        </h1>
        <div className="text-xs font-mono text-[#75726B]">
          Total: <strong>{products.length}</strong> barang
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#85827B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang..."
            className="w-full h-9 pl-9 pr-8 py-2 text-xs rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#121214] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Popover */}
        <CategoryFilterPopover
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalCount={products.length}
          categoryCounts={categoryCounts}
        />
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
                className="bg-white rounded-xl border border-[#E5E2DA] p-4 shadow-2xs hover:border-[#B8B4A8] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#121214] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#75726B] mt-0.5">
                        {product.category?.name} {product.unit?.name || product.unit?.symbol ? `· ${product.unit?.name || product.unit?.symbol}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#EAE8E2] flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#85827B] block tracking-wider">
                      Harga Jual
                    </span>
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
                      <span className="text-base font-extrabold font-mono text-[#121214]">
                        {formatRupiah(product.selling_price)}
                      </span>
                    )}
                  </div>

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

      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
