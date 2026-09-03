import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, getPriceHistory } from '../../../lib/db';
import type { Product, Category, PriceHistory } from '../../../types/database.types';
import { formatRupiah } from '../../../utils/currency';
import { getPriceChangeVisuals, OLD_PRICE_CLASS } from '../../../utils/priceColor';
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

  return (
    <div className="space-y-5 pb-6 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Katalog Produk
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
            Daftar Barang & Harga
          </h1>
          <p className="text-xs text-[#75726B]">
            Informasi harga jual resmi dan stok katalog barang toko
          </p>
        </div>
        <div className="text-xs font-mono text-[#75726B]">
          Total: <strong>{products.length}</strong> barang
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-3.5 shadow-2xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#85827B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang atau SKU..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] transition-all outline-none"
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

        {/* Category horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                className="bg-white rounded-xl border border-[#E5E2DA] p-4 shadow-2xs hover:border-[#B8B4A8] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#121214] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#75726B] mt-0.5">
                        {product.category?.name} {product.unit?.symbol ? `· ${product.unit.symbol}` : ''}
                      </p>
                    </div>
                    {product.sku && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F5F4EE] text-[#605D57] border border-[#E5E2DA] shrink-0">
                        {product.sku}
                      </span>
                    )}
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
