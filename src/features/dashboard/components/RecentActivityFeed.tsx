import React from 'react';
import type { ActivityLog } from '../../../types/database.types';
import { formatDateTime } from '../../../utils/date';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Edit3, TrendingUp, AlertTriangle } from 'lucide-react';

interface RecentActivityFeedProps {
  logs: ActivityLog[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ logs }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_PRODUCT':
      case 'CREATE_CATEGORY':
      case 'CREATE_UNIT':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'UPDATE_PRICE':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-600" />;
      case 'DEACTIVATE_PRODUCT':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      case 'EDIT_PRODUCT':
      default:
        return <Edit3 className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
        Belum ada catatan aktivitas admin.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Aktivitas Operasional
          </h2>
          <p className="text-xs text-slate-500">Audit trail tindakan Admin & perubahan data</p>
        </div>
        <Link
          to="/riwayat"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  {log.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                  <span>{log.user_name}</span>
                  <span>•</span>
                  <span>{formatDateTime(log.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
