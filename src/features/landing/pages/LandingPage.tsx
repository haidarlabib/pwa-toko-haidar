import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Mail,
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

  const googleMapsUrl = 'https://maps.app.goo.gl/B8NgAL8CXckXvFiZ9';
  const whatsappUrl =
    'https://wa.me/6281310989717?text=' +
    encodeURIComponent('Halo, Haidar. Saya tertarik untuk informasi ....');
  const emailUrl = 'mailto:haidarplastik20@gmail.com';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] antialiased selection:bg-[#EAE6DD] flex flex-col font-sans overflow-x-hidden">
      {/* Minimal Header (Branding only) */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE8E2] px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <img
              src="/logo.png"
              alt="Logo Haidar Plastik"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-[#121214]">
              Haidar Plastik
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-14 lg:pt-18 pb-16 sm:pb-24 space-y-16 sm:space-y-24">
        {/* Section 1: Hero Section */}
        <section
          ref={heroRef}
          className="w-full"
          aria-label="Hero Haidar Plastik"
        >
          {/* Desktop & Laptop Layout (>= lg): 2-Column Side-by-Side */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[420px]">
            {/* Left Column: Headline, Narrative & Primary CTA */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl lg:text-[54px] font-extrabold tracking-tight text-[#121214] leading-[1.08] text-balance">
                Kelola barang.<br />
                Pantau data.<br />
                <span className="text-[#75726B]">Lebih sederhana.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#4A4844] leading-relaxed max-w-lg font-normal">
                Pusat kendali operasional Haidar Plastik untuk pemeriksaan stok harian, penyesuaian harga resmi, dan pencatatan data secara terpusat.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleEnterSystem}
                  className="inline-flex items-center justify-center min-h-[48px] gap-2.5 px-7 py-3.5 rounded-lg bg-[#121214] text-white text-sm font-semibold hover:bg-[#2A2A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Character Animation */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <CursorScrubVideo containerRef={heroRef} />
            </div>
          </div>

          {/* Mobile & Tablet Layout (< lg): Natural Stacked Flow */}
          <div className="lg:hidden flex flex-col space-y-6 max-w-md mx-auto sm:max-w-lg">
            {/* 1. Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121214] leading-[1.12] text-balance">
              Kelola barang.<br />
              Pantau data.<br />
              <span className="text-[#75726B]">Lebih sederhana.</span>
            </h1>

            {/* 2. Description */}
            <p className="text-xs sm:text-sm text-[#4A4844] leading-relaxed font-normal">
              Pusat kendali operasional Haidar Plastik untuk pemeriksaan stok harian, penyesuaian harga resmi, dan pencatatan data secara terpusat.
            </p>

            {/* 3. Primary CTA */}
            <div>
              <button
                onClick={handleEnterSystem}
                className="w-full inline-flex items-center justify-center min-h-[48px] gap-2 px-6 py-3.5 rounded-lg bg-[#121214] text-white text-sm font-semibold hover:bg-[#2A2A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4. Character Visual */}
            <div className="w-full aspect-[16/10] flex items-center justify-center pt-2">
              <CursorScrubVideo />
            </div>
          </div>
        </section>

        {/* Section 2: Informasi Toko */}
        <section className="space-y-6" aria-label="Informasi Toko">
          <div className="pb-3 border-b border-[#EAE8E2] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-[#75726B]">
              Informasi Toko
            </span>
            <span className="text-xs font-mono text-[#85827B]">
              Lokasi & Kontak
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left Column: Visual Location & Map Preview */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group lg:col-span-7 rounded-xl border border-[#E5E2DA] bg-white overflow-hidden shadow-2xs hover:border-[#B8B4A8] hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer active:scale-[0.995]"
              aria-label="Buka lokasi Haidar Plastik di Google Maps"
            >
              {/* Stylized Editorial Map Canvas */}
              <div className="relative w-full h-44 sm:h-48 bg-[#F4F2EB] overflow-hidden flex items-center justify-center border-b border-[#EAE8E2] select-none">
                {/* SVG Street Grid Background */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-65 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 400 200"
                >
                  <defs>
                    <pattern id="street-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#E4DFD3" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#street-grid)" />
                  {/* Main Arterial Roads */}
                  <path d="M -20 70 Q 140 80 200 130 T 420 150" fill="none" stroke="#D5CFC0" strokeWidth="10" strokeLinecap="round" />
                  <path d="M -20 70 Q 140 80 200 130 T 420 150" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 150 -20 L 150 220" fill="none" stroke="#D5CFC0" strokeWidth="8" />
                  <path d="M 150 -20 L 150 220" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                  <path d="M 290 -20 Q 270 100 330 220" fill="none" stroke="#DDD7C8" strokeWidth="6" />
                  <path d="M 290 -20 Q 270 100 330 220" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                  {/* Subtle Neighborhood Blocks */}
                  <rect x="170" y="35" width="95" height="65" rx="4" fill="#EAE5D8" opacity="0.85" />
                  <rect x="40" y="95" width="85" height="55" rx="4" fill="#EAE5D8" opacity="0.85" />
                </svg>

                {/* Central Location Pin Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-10 h-10 rounded-full bg-[#121214]/15 animate-ping" />
                    <div className="w-9 h-9 rounded-full bg-[#121214] text-white flex items-center justify-center shadow-sm ring-4 ring-white">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 px-2.5 py-0.5 rounded bg-[#121214] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-2xs">
                    Haidar Plastik
                  </div>
                </div>

                {/* Region Tag */}
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded bg-white/90 backdrop-blur-xs border border-[#E5E2DA] text-[10px] font-mono font-semibold text-[#75726B]">
                  Bekasi, Jawa Barat
                </div>
              </div>

              {/* Location Text & CTA Button */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[#121214]">
                      Haidar Plastik
                    </h3>
                    <span className="text-xs text-[#75726B]">
                      · Kebalen, Kabupaten Bekasi
                    </span>
                  </div>
                  <p className="text-[11px] text-[#75726B] truncate max-w-sm">
                    Jalan Villa Gading Harapan Blok AG1 No.25, RT.01/RW.22
                  </p>
                </div>

                <div className="shrink-0 pt-1 sm:pt-0">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#121214] text-white text-xs font-semibold group-hover:bg-[#2A2A2E] transition-all shadow-2xs">
                    <span>Lihat Lokasi</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </a>

            {/* Right Column: Contact Action Rows */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
              {/* WhatsApp Action Row */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs hover:border-[#B8B4A8] hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.995]"
                aria-label="Hubungi Haidar Plastik via WhatsApp di +62 813-1098-9717"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF9F5] border border-[#EAE8E2] text-[#121214] flex items-center justify-center shrink-0 group-hover:bg-[#121214] group-hover:text-white group-hover:border-[#121214] transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75726B] block">
                      WhatsApp
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-[#121214] block truncate">
                      +62 813-1098-9717
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE8E2] text-[#75726B] flex items-center justify-center shrink-0 group-hover:bg-[#121214] group-hover:text-white group-hover:border-[#121214] transition-all">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>

              {/* Email Action Row */}
              <a
                href={emailUrl}
                className="group flex-1 bg-white rounded-xl border border-[#E5E2DA] p-4 sm:p-5 shadow-2xs hover:border-[#B8B4A8] hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.995]"
                aria-label="Kirim email ke Haidar Plastik di haidarplastik20@gmail.com"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF9F5] border border-[#EAE8E2] text-[#121214] flex items-center justify-center shrink-0 group-hover:bg-[#121214] group-hover:text-white group-hover:border-[#121214] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75726B] block">
                      Email
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-[#121214] block truncate">
                      haidarplastik20@gmail.com
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE8E2] text-[#75726B] flex items-center justify-center shrink-0 group-hover:bg-[#121214] group-hover:text-white group-hover:border-[#121214] transition-all">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#EAE8E2] py-8 px-4 sm:px-10 text-center text-xs text-[#85827B] font-mono">
        <p>Haidar Plastik © 2026 · Sistem Manajemen Operasional</p>
      </footer>
    </div>
  );
};
