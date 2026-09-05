import React, { useEffect, useState } from 'react';
import {
  getProducts,
  getCategories,
  getUnits,
  getPriceHistory,
} from '../../../lib/db';
import type {
  Product,
  Category,
  Unit,
  PriceHistory,
} from '../../../types/database.types';
import { getCurrentDay, formatDate, getJakartaNow } from '../../../lib/datetime';

// Modular Dashboard Components
import { InventorySearchHeader } from '../components/InventorySearchHeader';
import { InventoryKpiCards } from '../components/InventoryKpiCards';
import { ProductGrowthChart } from '../components/ProductGrowthChart';
import { CategoryDistributionCard } from '../components/CategoryDistributionCard';
import { TopStockCard } from '../components/TopStockCard';
import { LowStockCard } from '../components/LowStockCard';
import { PriceAnalyticsCard } from '../components/PriceAnalyticsCard';
import { UnitDistributionCard } from '../components/UnitDistributionCard';
import { ProductDetailModal } from '../../barang/components/ProductDetailModal';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [priceHistories, setPriceHistories] = useState<PriceHistory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prods, cats, unts, history] = await Promise.all([
        getProducts({ includeInactive: false }),
        getCategories(),
        getUnits(),
        getPriceHistory(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setUnits(unts);
      setPriceHistories(history);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayDayName = getCurrentDay();
  const todayDateFormatted = formatDate(getJakartaNow().toISOString());

  // Calculate price changes in the last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentPriceChangesCount = priceHistories.filter(
    (h) => new Date(h.created_at).getTime() >= thirtyDaysAgo
  ).length;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* 1. Search-First Header with Live Search & Date (Replaces Greeting Section) */}
      <InventorySearchHeader
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        todayDayName={todayDayName}
        todayDateFormatted={todayDateFormatted}
      />

      {/* 2. KPI / Statistic Cards (4 Columns Desktop, 2 Columns Mobile) */}
      <InventoryKpiCards
        totalProducts={products.length}
        totalCategories={categories.length}
        totalUnits={units.length}
        priceChangesCount={recentPriceChangesCount}
        loading={loading}
      />

      {/* 3. Data Visualizations: Perkembangan Barang & Sebaran Kategori (2 Columns Desktop, 1 Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* A. Perkembangan Jumlah Barang */}
        <ProductGrowthChart products={products} loading={loading} />

        {/* B. Sebaran Barang per Kategori */}
        <CategoryDistributionCard
          products={products}
          categories={categories}
          loading={loading}
        />
      </div>

      {/* 4. Stock Analytics: Stok Terbanyak & Stok Terendah (2 Columns Desktop, 1 Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* A. Stok Terbanyak (Top 5) */}
        <TopStockCard products={products} loading={loading} />

        {/* B. Stok Terendah (Lowest 5) */}
        <LowStockCard products={products} loading={loading} />
      </div>

      {/* 5. Price & Unit Analytics: Perubahan Harga & Distribusi Satuan (2 Columns Desktop, 1 Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* A. Perubahan Harga Resmi */}
        <PriceAnalyticsCard
          priceHistories={priceHistories}
          loading={loading}
        />

        {/* B. Distribusi Satuan */}
        <UnitDistributionCard
          products={products}
          units={units}
          loading={loading}
        />
      </div>

      {/* 6. Product Detail Modal for Quick Search Inspection */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
