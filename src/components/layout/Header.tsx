import React from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { RotateCcw, Clock } from 'lucide-react';
import { resetDatabase } from '../../lib/db';
import { useAppStore } from '../../stores/appStore';
import { useRealtimeClock } from '../../lib/datetime';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { showToast } = useAppStore();
  const clock = useRealtimeClock();

  const handleQuickReset = async () => {
    if (window.confirm('Reset ulang data demo Haidar Plastik?')) {
      await resetDatabase();
      showToast('Database berhasil direset');
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div>
        <div className="flex items-center gap-2">
          {/* Mobile brand indicator */}
          <span className="md:hidden w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Real-time Clock (PRD v2.0 Section 10) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{clock.fullDisplay}</span>
        </div>

        {actions}
        <div className="md:hidden">
          <OfflineIndicator />
        </div>
        <button
          onClick={handleQuickReset}
          title="Reset database demo"
          className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
