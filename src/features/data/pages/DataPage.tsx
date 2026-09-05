import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/common/Button';
import { CategoryFilterPopover } from '../../../components/common/CategoryFilterPopover';
import { ProductDataTable } from '../components/ProductDataTable';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { UpdatePriceModal } from '../components/UpdatePriceModal';
import { DeactivateModal } from '../components/DeactivateModal';
import { CategoryManagerModal } from '../components/CategoryManagerModal';
import { UnitManagerModal } from '../components/UnitManagerModal';
import {
  getProducts,
  getCategories,
  getUnits,
} from '../../../lib/db';
import type { Product, Category, Unit } from '../../../types/database.types';
import {
  Plus,
  Search,
  X,
} from 'lucide-react';

export const DataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'barang' | 'kategori' | 'satuan'>('barang');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);

  // Action target products
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [updatePriceProduct, setUpdatePriceProduct] = useState<Product | null>(null);
  const [deactivateProduct, setDeactivateProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, c, u] = await Promise.all([
        getProducts({ includeInactive: false }),
        getCategories(),
        getUnits(),
      ]);
      setProducts(p);
      setCategories(c);
      setUnits(u);
    } catch (err) {
      console.error('Failed to load data page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight">
          Manajemen Data & Harga
        </h1>

        {/* Primary Action Button based on tab */}
        {activeTab === 'barang' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="self-start sm:self-auto font-semibold bg-[#121214] text-white hover:bg-[#2A2A2E]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Barang</span>
          </Button>
        )}
      </div>

      {/* Segmented Tabs Control */}
      <div className="flex p-1 bg-[#F5F4EE] rounded-lg border border-[#E5E2DA] max-w-md text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('barang')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'barang'
              ? 'bg-white text-[#121214] shadow-2xs font-bold'
              : 'text-[#75726B] hover:text-[#121214]'
          }`}
        >
          Barang ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kategori')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'kategori'
              ? 'bg-white text-[#121214] shadow-2xs font-bold'
              : 'text-[#75726B] hover:text-[#121214]'
          }`}
        >
          Kategori ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('satuan')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
            activeTab === 'satuan'
              ? 'bg-white text-[#121214] shadow-2xs font-bold'
              : 'text-[#75726B] hover:text-[#121214]'
          }`}
        >
          Satuan ({units.length})
        </button>
      </div>

      {/* TAB 1: BARANG MANAGEMENT */}
      {activeTab === 'barang' && (
        <div className="space-y-4">
          {/* Search & Category Filter Control Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-[#85827B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama barang atau kategori..."
                className="w-full h-10 pl-9 pr-8 py-2 text-xs rounded-lg border border-[#D5D2C9] bg-[#FAF9F5] text-[#121214] placeholder:text-[#85827B] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] transition-all outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#121214] p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <CategoryFilterPopover
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalCount={products.length}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Product Data Table */}
          {loading ? (
            <div className="p-8 bg-white rounded-xl border border-[#E5E2DA] text-center text-xs text-[#75726B]">
              Memuat data barang...
            </div>
          ) : (
            <ProductDataTable
              products={filteredProducts}
              onEdit={(p) => setEditProduct(p)}
              onUpdatePrice={(p) => setUpdatePriceProduct(p)}
              onDeactivate={(p) => setDeactivateProduct(p)}
            />
          )}
        </div>
      )}

      {/* TAB 2: KATEGORI MANAGEMENT */}
      {activeTab === 'kategori' && (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE8E2]">
            <div>
              <h3 className="text-sm font-bold text-[#121214]">Master Kategori Produk</h3>
              <p className="text-xs text-[#75726B]">Pengelompokan jenis barang toko Haidar Plastik</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCategoryOpen(true)}
              className="bg-[#121214] text-white hover:bg-[#2A2A2E]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kelola Kategori</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] flex items-center justify-between"
                >
                  <div>
                    <strong className="text-sm font-bold text-[#121214] block">{cat.name}</strong>
                    <span className="text-[11px] text-[#75726B] font-mono">{count} produk terdaftar</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SATUAN MANAGEMENT */}
      {activeTab === 'satuan' && (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE8E2]">
            <div>
              <h3 className="text-sm font-bold text-[#121214]">Master Satuan Unit</h3>
              <p className="text-xs text-[#75726B]">Daftar satuan unit inventori (PCS, PACK, DUS, KG, dll.)</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUnitOpen(true)}
              className="bg-[#121214] text-white hover:bg-[#2A2A2E]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kelola Satuan</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {units.map((unit) => {
              const count = products.filter((p) => p.unit_id === unit.id).length;
              return (
                <div
                  key={unit.id}
                  className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2DA] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-sm font-bold text-[#121214]">{unit.name}</strong>
                      <span className="text-xs font-mono font-bold text-[#75726B]">({unit.symbol})</span>
                    </div>
                    <span className="text-[11px] text-[#75726B] font-mono">{count} produk menggunakan</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CRUD MODALS */}
      {isAddOpen && (
        <AddProductModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            loadData();
          }}
          categories={categories}
          units={units}
        />
      )}

      {editProduct && (
        <EditProductModal
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            setEditProduct(null);
            loadData();
          }}
          product={editProduct}
          categories={categories}
          units={units}
        />
      )}

      {updatePriceProduct && (
        <UpdatePriceModal
          isOpen={!!updatePriceProduct}
          onClose={() => setUpdatePriceProduct(null)}
          onSuccess={() => {
            setUpdatePriceProduct(null);
            loadData();
          }}
          product={updatePriceProduct}
        />
      )}

      {deactivateProduct && (
        <DeactivateModal
          isOpen={!!deactivateProduct}
          onClose={() => setDeactivateProduct(null)}
          onSuccess={() => {
            setDeactivateProduct(null);
            loadData();
          }}
          product={deactivateProduct}
        />
      )}

      {isCategoryOpen && (
        <CategoryManagerModal
          isOpen={isCategoryOpen}
          onClose={() => setIsCategoryOpen(false)}
          onSuccess={() => {
            setIsCategoryOpen(false);
            loadData();
          }}
          categories={categories}
        />
      )}

      {isUnitOpen && (
        <UnitManagerModal
          isOpen={isUnitOpen}
          onClose={() => setIsUnitOpen(false)}
          onSuccess={() => {
            setIsUnitOpen(false);
            loadData();
          }}
          units={units}
        />
      )}
    </div>
  );
};
