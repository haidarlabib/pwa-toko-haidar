import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../../components/layout/Header';
import { PriceHistoryTab } from '../components/PriceHistoryTab';
import { StockCheckTab } from '../components/StockCheckTab';
import { EditRequestTab } from '../components/EditRequestTab';
import { ActivityLogTab } from '../components/ActivityLogTab';
import {
  getPriceHistory,
  getStockChecks,
  getActivityLogs,
  getProducts,
  getEditRequests,
} from '../../../lib/db';
import type {
  PriceHistory,
  StockCheck,
  ActivityLog,
  Product,
  StockCheckEditRequest,
} from '../../../types/database.types';
import { TrendingUp, ClipboardCheck, Activity, Layers, FileQuestion } from 'lucide-react';

type TabType = 'harga' | 'stock' | 'requests' | 'activity' | 'all';

export const RiwayatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'harga';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);

  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [editRequests, setEditRequests] = useState<(StockCheckEditRequest & { product_name?: string })[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadAllHistory = async () => {
    try {
      setLoading(true);
      const [history, checks, reqs, logs, prods] = await Promise.all([
        getPriceHistory(),
        getStockChecks(),
        getEditRequests(),
        getActivityLogs(),
        getProducts({ includeInactive: true }),
      ]);
      setPriceHistory(history);
      setStockChecks(checks);
      setEditRequests(reqs);
      setActivityLogs(logs);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHistory();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === 'harga' ? {} : { tab });
  };

  const pendingCount = editRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Riwayat & Audit"
        subtitle="Pelacakan lengkap perubahan harga resmi, laporan pengamatan fisik staf, permintaan edit, & log aktivitas Admin"
      />

      <div className="p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Navigation Tabs (PRD v2.0 Section 67) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-300/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('harga')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'harga'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Harga ({priceHistory.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'stock'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
            <span>Pemeriksaan Stok ({stockChecks.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-amber-600" />
            <span>
              Request Edit ({editRequests.length})
              {pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'activity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Activity Log ({activityLogs.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Semua Ringkasan</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-400 animate-pulse">
            Memuat data riwayat dan audit...
          </div>
        ) : (
          <div>
            {activeTab === 'harga' && <PriceHistoryTab history={priceHistory} />}

            {activeTab === 'stock' && (
              <StockCheckTab
                checks={stockChecks}
                products={products}
                onRefresh={loadAllHistory}
              />
            )}

            {activeTab === 'requests' && (
              <EditRequestTab
                requests={editRequests}
                onRefresh={loadAllHistory}
              />
            )}

            {activeTab === 'activity' && <ActivityLogTab logs={activityLogs} />}

            {activeTab === 'all' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Permintaan Edit Menunggu Persetujuan
                  </h3>
                  <EditRequestTab
                    requests={editRequests.slice(0, 5)}
                    onRefresh={loadAllHistory}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Riwayat Perubahan Harga Resmi
                  </h3>
                  <PriceHistoryTab history={priceHistory.slice(0, 5)} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Laporan Pengamatan Fisik Staf Toko
                  </h3>
                  <StockCheckTab
                    checks={stockChecks.slice(0, 5)}
                    products={products}
                    onRefresh={loadAllHistory}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Aktivitas Operasional Admin
                  </h3>
                  <ActivityLogTab logs={activityLogs.slice(0, 5)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
