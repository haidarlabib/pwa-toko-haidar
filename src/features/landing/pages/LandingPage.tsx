import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  ArrowRight,
  Clock,
  SlidersHorizontal,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { CursorScrubVideo } from '../components/CursorScrubVideo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAppStore();
  const heroRef = useRef<HTMLElement | null>(null);

  const handleEnterSystem = () => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] antialiased selection:bg-[#EAE6DD] flex flex-col font-sans overflow-x-hidden">
      {/* Quiet Minimal Header (PRD Section 7) */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE8E2] px-4 sm:px-8 lg:px-10 py-3.5 sm:py-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#121214]" />
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-[#121214]">
              Haidar Plastik
            </span>
          </div>

          <button
            onClick={handleEnterSystem}
            className="inline-flex items-center justify-center min-h-[38px] gap-1.5 px-3.5 py-1.5 rounded-md bg-[#121214] text-white text-xs font-semibold hover:bg-[#2C2C30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            <span>Masuk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 lg:px-10 pt-6 sm:pt-10 lg:pt-14 pb-16 sm:pb-20 space-y-16 sm:space-y-24">
        {/* Section 1: Responsive Art-Directed Hero Section */}
        <section
          ref={heroRef}
          className="w-full"
        >
          {/* Desktop & Laptop Layout (>= lg): 2-Column Side-by-Side */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[460px]">
            {/* Left Column: Headline, Narrative & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#75726B] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Sistem Operasional Inventori</span>
              </div>

              <h1 className="text-4xl lg:text-[54px] font-extrabold tracking-tight text-[#121214] leading-[1.08] text-balance">
                Kelola barang.<br />
                Pantau data.<br />
                <span className="text-[#75726B]">Lebih sederhana.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#4A4844] leading-relaxed max-w-lg font-normal">
                Satu sistem untuk mengelola barang, memantau perubahan harga resmi,
                melakukan pemeriksaan stok harian, dan menjaga riwayat operasional tetap teratur.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={handleEnterSystem}
                  className="inline-flex items-center justify-center min-h-[44px] gap-2 px-6 py-3 rounded-md bg-[#121214] text-white text-sm font-semibold hover:bg-[#2A2A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#85827B] font-mono">
                  PWA Operasional Toko
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Character Scrub Experience */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <CursorScrubVideo containerRef={heroRef} />
            </div>
          </div>

          {/* Mobile & Tablet Layout (< lg): Purpose-Built Mobile Flow */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-lg mx-auto">
            {/* 1. Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#75726B] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Sistem Operasional Inventori</span>
            </div>

            {/* 2. Responsive Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121214] leading-[1.12] text-balance">
              Kelola barang.<br />
              Pantau data.<br />
              <span className="text-[#75726B]">Lebih sederhana.</span>
            </h1>

            {/* 3. Concise Narrative */}
            <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed max-w-md font-normal px-2">
              Satu sistem untuk mengelola barang, memantau perubahan harga resmi,
              melakukan pemeriksaan stok harian, dan menjaga riwayat operasional tetap teratur.
            </p>

            {/* 4. Full-Body Character Poster Visual */}
            <div className="w-full max-w-[260px] sm:max-w-[320px] aspect-[16/10] flex items-center justify-center py-1">
              <CursorScrubVideo />
            </div>

            {/* 5. Mobile Touch-Optimized Primary CTA */}
            <div className="w-full space-y-2 pt-1">
              <button
                onClick={handleEnterSystem}
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] gap-2 px-8 py-3.5 rounded-lg bg-[#121214] text-white text-sm font-semibold hover:bg-[#2A2A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-[#85827B] font-mono">
                PWA Operasional Toko
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Progressive Capabilities Storytelling (PRD Section 12 & 13) */}
        <section className="space-y-6 sm:space-y-8">
          <div className="pb-3 border-b border-[#EAE8E2] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-[#75726B]">
              Kapabilitas Sistem
            </span>
            <span className="text-xs font-mono text-[#85827B]">
              4 Konsep Inti
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1: LIHAT */}
            <div className="space-y-2.5 pb-6 border-b border-[#EAE8E2]/80">
              <div className="flex items-center gap-2 text-xs font-mono text-[#75726B]">
                <Eye className="w-3.5 h-3.5 text-[#121214]" />
                <span className="font-bold uppercase text-[#121214]">01 / Lihat</span>
                <span>·</span>
                <span>Barang</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#121214]">
                Katalog produk terstruktur dan bersih.
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed">
                Menampilkan informasi barang, SKU, kategori, ketersediaan stok, dan harga jual resmi toko tanpa tombol aksi yang membingungkan.
              </p>
            </div>

            {/* Capability 2: KELOLA */}
            <div className="space-y-2.5 pb-6 border-b border-[#EAE8E2]/80">
              <div className="flex items-center gap-2 text-xs font-mono text-[#75726B]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#121214]" />
                <span className="font-bold uppercase text-[#121214]">02 / Kelola</span>
                <span>·</span>
                <span>Data</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#121214]">
                Pusat manajemen master dan pembaruan harga.
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed">
                Kelola barang, konfigurasi jadwal pemeriksaan harian per hari kalender, dan lakukan pembaruan harga resmi bertingkat dengan kenaikan versi otomatis.
              </p>
            </div>

            {/* Capability 3: LACAK */}
            <div className="space-y-2.5 pb-6 border-b border-[#EAE8E2]/80">
              <div className="flex items-center gap-2 text-xs font-mono text-[#75726B]">
                <Clock className="w-3.5 h-3.5 text-[#121214]" />
                <span className="font-bold uppercase text-[#121214]">03 / Lacak</span>
                <span>·</span>
                <span>Riwayat</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#121214]">
                Jejak audit permanen dan laporan staf.
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed">
                Audit riwayat kenaikan dan penurunan harga, laporan pemeriksaan fisik staf dengan teks mentah, serta rekam putusan persetujuan edit data.
              </p>
            </div>

            {/* Capability 4: KELUARKAN */}
            <div className="space-y-2.5 pb-6 border-b border-[#EAE8E2]/80">
              <div className="flex items-center gap-2 text-xs font-mono text-[#75726B]">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#121214]" />
                <span className="font-bold uppercase text-[#121214]">04 / Keluarkan</span>
                <span>·</span>
                <span>Export</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#121214]">
                Ekspor 8 dataset inventori resmi.
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed">
                Keluarkan data barang, harga, stok, jadwal periksa, riwayat harga, laporan cek, dan log aktivitas ke dokumen Excel (.xlsx) dan PDF dengan pratinjau tabel instan.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Operational Philosophy Strip (PRD Section 12) */}
        <section className="py-6 sm:py-8 px-5 sm:px-8 bg-white rounded-xl border border-[#E5E2DA] space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-[#75726B] uppercase block">
            Filosofi Desain Produk
          </span>
          <blockquote className="text-sm sm:text-xl font-bold text-[#121214] tracking-tight leading-snug">
            "Barang untuk melihat. Data untuk mengelola. Riwayat untuk melacak. Export untuk mengeluarkan data."
          </blockquote>
          <p className="text-xs text-[#75726B]">
            Setiap konsep dirancang terpisah agar operasional toko tetap cepat, teratur, dan bebas kesalahan.
          </p>
        </section>

        {/* Section 4: Final Focused CTA (PRD Section 15) */}
        <section className="text-center space-y-4 py-8 border-t border-[#EAE8E2]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#121214] tracking-tight">
            Siap masuk ke sistem?
          </h2>
          <p className="text-xs sm:text-sm text-[#75726B] max-w-md mx-auto">
            Gunakan akun resmi yang telah terdaftar untuk masuk ke lingkungan kerja Anda.
          </p>
          <div>
            <button
              onClick={handleEnterSystem}
              className="inline-flex items-center justify-center min-h-[44px] gap-2 px-6 py-3 rounded-md bg-[#121214] text-white text-xs sm:text-sm font-semibold hover:bg-[#2A2A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
            >
              <span>Masuk ke Haidar Plastik</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#EAE8E2] py-6 px-4 sm:px-10 text-center text-xs text-[#85827B] font-mono">
        <p>Haidar Plastik © 2026 · Sistem Manajemen Inventori & Operasional</p>
      </footer>
    </div>
  );
};
