import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../stores/appStore';
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Mail,
  ExternalLink,
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

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Jalan+Villa+Gading+Harapan+Blok+AG1+No.25,+RT.01/RW.22,+Kebalen,+Kec.+Babelan,+Kabupaten+Bekasi,+Jawa+Barat+17610';
  const whatsappUrl =
    'https://wa.me/6281310989717?text=' +
    encodeURIComponent('Halo, Haidar. Saya tertarik untuk informasi ....');
  const emailUrl = 'mailto:haidarplastik20@gmail.com';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121214] antialiased selection:bg-[#EAE6DD] flex flex-col font-sans overflow-x-hidden">
      {/* Minimal Header */}
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

          <button
            onClick={handleEnterSystem}
            className="inline-flex items-center justify-center min-h-[40px] gap-1.5 px-4 py-2 rounded-lg bg-[#121214] text-white text-xs font-semibold hover:bg-[#2C2C30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121214] transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
            aria-label="Masuk ke Sistem"
          >
            <span>Masuk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
              Kontak & Lokasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Alamat */}
            <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#D5D2C9] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#121214]">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE8E2] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#121214]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75726B]">
                    Alamat
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#33312E] leading-relaxed">
                  Jalan Villa Gading Harapan Blok AG1 No.25, RT.01/RW.22, Kebalen, Kec. Babelan, Kabupaten Bekasi, Jawa Barat 17610
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE8E2]">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121214] hover:text-[#2A2A2E] hover:underline transition-colors cursor-pointer group"
                >
                  <span>Lihat di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#75726B] group-hover:text-[#121214] transition-colors" />
                </a>
              </div>
            </div>

            {/* Card 2: WhatsApp */}
            <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#D5D2C9] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#121214]">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE8E2] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#121214]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75726B]">
                    WhatsApp
                  </span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold font-mono text-[#121214]">
                    +62 813-1098-9717
                  </p>
                  <p className="text-xs text-[#75726B] mt-0.5">
                    Layanan pesan & informasi operasional
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE8E2]">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121214] hover:text-[#2A2A2E] hover:underline transition-colors cursor-pointer group"
                >
                  <span>Hubungi via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#75726B] group-hover:text-[#121214] transition-colors" />
                </a>
              </div>
            </div>

            {/* Card 3: Email */}
            <div className="bg-white rounded-xl border border-[#E5E2DA] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#D5D2C9] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#121214]">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE8E2] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#121214]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75726B]">
                    Email
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[#121214] break-all">
                    haidarplastik20@gmail.com
                  </p>
                  <p className="text-xs text-[#75726B] mt-0.5">
                    Korespondensi & administrasi toko
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE8E2]">
                <a
                  href={emailUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121214] hover:text-[#2A2A2E] hover:underline transition-colors cursor-pointer group"
                >
                  <span>Kirim Pesan Email</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#75726B] group-hover:text-[#121214] transition-colors" />
                </a>
              </div>
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
