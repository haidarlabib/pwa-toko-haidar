import React from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { Clock } from 'lucide-react';
import { useRealtimeClock } from '../../lib/datetime';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const clock = useRealtimeClock();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E5E2DA] px-4 sm:px-6 py-3.5 flex items-center justify-between font-sans">
      <div>
        <div className="flex items-center gap-2">
          <span className="md:hidden w-2 h-2 rounded-full bg-emerald-700 shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-[#121214] tracking-tight leading-tight">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-xs text-[#75726B] mt-0.5 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#F5F4EE] rounded-lg text-xs font-mono text-[#4A4844] border border-[#E5E2DA]">
          <Clock className="w-3.5 h-3.5 text-emerald-800" />
          <span>{clock.fullDisplay}</span>
        </div>

        {actions}
        <div className="md:hidden">
          <OfflineIndicator />
        </div>
      </div>
    </header>
  );
};
