import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useAppStore();

  if (isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-300">
      <WifiOff className="w-3 h-3 text-amber-600 shrink-0" />
      <span>Offline — data tersimpan lokal</span>
    </div>
  );
};
