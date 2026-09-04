import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../stores/appStore';
import {
  getProducts,
  getTodayStockChecks,
  getStockChecks,
  submitStockCheck,
  requestStockCheckEdit,
} from '../../../lib/db';
import { getScheduledProductsForToday } from '../../../lib/inspectionSchedule';
import type { Product, StockCheck } from '../../../types/database.types';
import { getCurrentDay, formatDate, formatDateTime, getTodayDateString, getJakartaNow } from '../../../lib/datetime';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import {
  ClipboardCheck,
  CheckCircle2,
  Lock,
  Edit3,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const UserCheckPage: React.FC = () => {
  const { currentUser, showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [products, setProducts] = useState<Product[]>([]);
  const [todayChecks, setTodayChecks] = useState<StockCheck[]>([]);
  const [allUserChecks, setAllUserChecks] = useState<StockCheck[]>([]);
  const [loading, setLoading] = useState(true);

  // Active form modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCheck, setActiveCheck] = useState<StockCheck | null>(null);

  // Form fields (Strictly raw TEXT per PRD Sections 20-21, BR-U14)
  const [prevStock, setPrevStock] = useState('');
  const [currStock, setCurrStock] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Request modal state (PRD Sections 25-27)
  const [isEditRequestOpen, setIsEditRequestOpen] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [isSubmittingEditRequest, setIsSubmittingEditRequest] = useState(false);

  const todayDayName = getCurrentDay();
  const formattedTodayDate = formatDate(getJakartaNow().toISOString());

  const loadData = async () => {
    try {
      setLoading(true);
      const [allProds, checksToday, allChecks] = await Promise.all([
        getProducts({ includeInactive: false }),
        getTodayStockChecks(new Date()),
        getStockChecks(),
      ]);
      setProducts(allProds);
      setTodayChecks(checksToday);
      setAllUserChecks(allChecks);
    } catch (err) {
      console.error('Failed to load check page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const scheduledProducts = getScheduledProductsForToday(products);

  // Map product_id to today's check
  const todayCheckMap = new Map<string, StockCheck>();
  for (const c of todayChecks) {
    todayCheckMap.set(c.product_id, c);
  }

  // Open inspection form for a product
  const handleOpenCheck = (product: Product) => {
    setSelectedProduct(product);
    const existing = todayCheckMap.get(product.id);
    if (existing) {
      setActiveCheck(existing);
      setPrevStock(existing.previous_stock);
      setCurrStock(existing.current_stock);
      setNote(existing.note || '');
    } else {
      setActiveCheck(null);
      setPrevStock(`${product.stock} ${product.unit?.symbol || 'pcs'}`);
      setCurrStock('');
      setNote('');
    }
  };

  // Submit inspection form
  const handleSaveCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!currStock.trim()) {
      showToast('Wajib mengisi stok fisik sekarang', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitStockCheck({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        user_id: currentUser?.id || 'u-anonymous',
        user_name: currentUser?.name || 'Staff Toko',
        previous_stock: prevStock.trim(),
        current_stock: currStock.trim(),
        note: note.trim(),
        check_date: getTodayDateString(),
      });

      showToast(`Pemeriksaan "${selectedProduct.name}" berhasil disimpan dan terkunci!`);
      setSelectedProduct(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pemeriksaan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit request to Admin (PRD Section 25-27)
  const handleSubmitEditRequest = async () => {
    if (!activeCheck) return;
    if (!editReason.trim()) {
      showToast('Wajib mengisi alasan meminta edit', 'error');
      return;
    }

    try {
      setIsSubmittingEditRequest(true);
      await requestStockCheckEdit(
        activeCheck.id,
        editReason.trim(),
        currentUser?.name || 'Staff Toko'
      );
      showToast('Permintaan edit telah dikirim ke Admin. Menunggu persetujuan.');
      setIsEditRequestOpen(false);
      setEditReason('');
      setSelectedProduct(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim permintaan edit', 'error');
    } finally {
      setIsSubmittingEditRequest(false);
    }
  };

  const isLocked = activeCheck && activeCheck.status !== 'EDIT_APPROVED';

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* 1. Header with Live Dynamic Context (PRD Section 29) */}
      <div className="pb-3 border-b border-[#EAE8E2] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Lembar Pemeriksaan Harian
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight mt-0.5">
            Pemeriksaan Stok Barang
          </h1>
          <p className="text-xs text-[#75726B]">
            {todayDayName}, {formattedTodayDate} · {scheduledProducts.length} barang terjadwal
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-[#F5F4EE] rounded-lg border border-[#E5E2DA] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'today'
                ? 'bg-white text-[#121214] shadow-2xs'
                : 'text-[#75726B] hover:text-[#121214]'
            }`}
          >
            Jadwal Hari Ini ({scheduledProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#121214] shadow-2xs'
                : 'text-[#75726B] hover:text-[#121214]'
            }`}
          >
            Arsip Hasil Cek ({allUserChecks.length})
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT: Fast-scanning operational list (PRD Section 30) */}
      {activeTab === 'today' ? (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 bg-white rounded-xl border border-[#E5E2DA] text-center text-xs text-[#75726B]">
              Memuat jadwal pemeriksaan hari ini...
            </div>
          ) : scheduledProducts.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-[#E5E2DA] text-center space-y-2">
              <ClipboardCheck className="w-8 h-8 text-[#85827B] mx-auto" />
              <h3 className="text-sm font-bold text-[#121214]">
                Tidak Ada Jadwal Pemeriksaan untuk Hari {todayDayName}
              </h3>
              <p className="text-xs text-[#75726B] max-w-sm mx-auto">
                Admin belum menjadwalkan produk apapun untuk diperiksa pada hari ini.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] text-xs">
              {scheduledProducts.map((product) => {
                const check = todayCheckMap.get(product.id);

                return (
                  <div
                    key={product.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#121214] truncate">
                          {product.name}
                        </strong>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#605D57] font-mono">
                        <span>
                          Stok Sistem: <strong className="text-[#121214]">{product.stock} {product.unit?.name || product.unit?.symbol || ''}</strong>
                        </span>
                        <span>·</span>
                        <span>{product.category?.name}</span>
                      </div>

                      {/* Status Tag */}
                      <div className="pt-1 flex items-center gap-2">
                        {!check ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            ○ Belum Diperiksa
                          </span>
                        ) : check.status === 'EDIT_REQUESTED' ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            ⏳ Menunggu Persetujuan Edit
                          </span>
                        ) : check.status === 'EDIT_APPROVED' ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                            ✓ Edit Disetujui (Siap Direvisi)
                          </span>
                        ) : check.status === 'EDIT_REJECTED' ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                            ✕ Permintaan Edit Ditolak
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                            ✓ Selesai (Terkunci)
                          </span>
                        )}

                        {check && (
                          <span className="text-[11px] font-mono text-[#75726B]">
                            Fisik: <strong>"{check.current_stock}"</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      {!check ? (
                        <button
                          onClick={() => handleOpenCheck(product)}
                          className="px-4 py-2 rounded-md bg-[#121214] text-white text-xs font-semibold hover:bg-[#2A2A2E] transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-2xs"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Periksa</span>
                        </button>
                      ) : check.status === 'EDIT_APPROVED' ? (
                        <button
                          onClick={() => handleOpenCheck(product)}
                          className="px-4 py-2 rounded-md bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Ulang</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCheck(product)}
                          className="px-3 py-1.5 rounded-md bg-[#F5F4EE] border border-[#E5E2DA] hover:bg-[#EAE8E2] text-[#4A4844] text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <Lock className="w-3 h-3 text-[#75726B]" />
                          <span>Lihat / Minta Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* History Archive Tab */
        <div className="space-y-3">
          {allUserChecks.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-[#E5E2DA] text-center text-xs text-[#75726B]">
              Belum ada riwayat hasil pemeriksaan stok.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] text-xs">
              {allUserChecks.map((check) => (
                <div key={check.id} className="p-4 space-y-2 hover:bg-[#FAF9F5] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-bold text-[#121214]">
                        {check.product_name}
                      </strong>
                      <div className="text-[11px] text-[#75726B] font-mono">
                        Pemeriksa: <strong>{check.user_name}</strong> · {formatDateTime(check.created_at)}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {check.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#FAF9F5] rounded border border-[#E5E2DA] flex items-center gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#75726B] block">Sebelumnya</span>
                      <span className="text-[#605D57]">"{check.previous_stock}"</span>
                    </div>
                    <span>→</span>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">Fisik Sekarang</span>
                      <strong className="text-[#121214]">"{check.current_stock}"</strong>
                    </div>
                  </div>

                  {check.note && (
                    <div className="text-[11px] text-[#55524D] italic">
                      Catatan: "{check.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FORM PEMERIKSAAN STOK (PRD Section 31 & 32) */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Pemeriksaan Stok: ${selectedProduct.name}`}
          subtitle={`Stok Sistem Toko: ${selectedProduct.stock} ${selectedProduct.unit?.symbol || ''}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              {isLocked ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-xs text-[#75726B]">
                    {activeCheck?.status === 'EDIT_REQUESTED'
                      ? '⏳ Permintaan edit sedang ditinjau Admin'
                      : '🔒 Pemeriksaan telah terkunci'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Tutup
                    </Button>
                    {activeCheck?.status === 'SUBMITTED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditRequestOpen(true)}
                        className="font-bold text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Minta Edit</span>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCheck}
                    isLoading={isSubmitting}
                    className="font-bold bg-[#121214] text-white hover:bg-[#2A2A2E]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Kunci Hasil</span>
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <form onSubmit={handleSaveCheck} className="space-y-4 text-xs font-sans">
            {/* Context Note */}
            <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E5E2DA] flex items-start gap-2 text-[#55524D]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#75726B] mt-0.5" />
              <p className="leading-relaxed">
                Tuliskan kondisi fisik nyata yang Anda amati di toko (contoh: <code className="font-mono font-bold">120 pak</code>, <code className="font-mono font-bold">50 dus + 10 pcs</code>). Data ini murni observasi dan tidak mengubah angka stok sistem.
              </p>
            </div>

            {/* Input 1: Stok Sebelumnya */}
            <Input
              label="Stok Sebelumnya (Teks Bebas)"
              placeholder="Contoh: 120 pak"
              value={prevStock}
              onChange={(e) => setPrevStock(e.target.value)}
              disabled={Boolean(isLocked)}
              helperText="Kondisi stok sebelum pemeriksaan saat ini"
            />

            {/* Input 2: Stok Sekarang */}
            <Input
              label="Stok Fisik Sekarang (Wajib / Teks Bebas)"
              placeholder="Contoh: 118 pak (2 pak rusak kemasan)"
              value={currStock}
              onChange={(e) => setCurrStock(e.target.value)}
              disabled={Boolean(isLocked)}
              required
              helperText="Kondisi riil stok saat diperiksa di toko"
            />

            {/* Input 3: Catatan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#33312E] block">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Catatan kondisi barang, kemasan, atau posisi rak..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={Boolean(isLocked)}
                className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all disabled:bg-[#F5F4EE] disabled:text-[#85827B]"
              />
            </div>

            {isLocked && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Pemeriksaan ini telah disimpan pada <strong>{formatDateTime(activeCheck?.created_at)}</strong>. Data telah dikunci untuk menjaga integritas riwayat.</span>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* MODAL 2: REQUEST EDIT (PRD Section 25-27) */}
      {isEditRequestOpen && activeCheck && (
        <Modal
          isOpen={isEditRequestOpen}
          onClose={() => setIsEditRequestOpen(false)}
          title="Ajukan Permintaan Edit Pemeriksaan"
          subtitle={`Produk: ${selectedProduct?.name}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditRequestOpen(false)}
                disabled={isSubmittingEditRequest}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitEditRequest}
                isLoading={isSubmittingEditRequest}
                className="font-bold bg-amber-800 text-white hover:bg-amber-900"
              >
                Kirim Permintaan ke Admin
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs font-sans">
            <p className="text-[#55524D] leading-relaxed">
              Karena pemeriksaan telah dikunci, koreksi data memerlukan persetujuan dari Administrator.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#33312E] block">
                Alasan Koreksi / Edit (Wajib)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Salah hitung kardus di rak belakang, seharusnya 55 dus..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-[#D5D2C9] focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none transition-all"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
