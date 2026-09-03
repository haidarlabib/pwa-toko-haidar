import React, { useState } from 'react';
import type { ActivityLog } from '../../../types/database.types';
import { formatDateTime } from '../../../utils/date';
import { ShieldCheck, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface ActivityLogTabProps {
  logs: ActivityLog[];
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ logs }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Belum ada catatan aktivitas admin.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const hasPayload = Boolean(log.old_data || log.new_data);

            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => hasPayload && toggleExpand(log.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {log.user_name}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {log.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {formatDateTime(log.created_at)}
                    </span>
                    {hasPayload && (
                      <button
                        type="button"
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible JSON diff payload */}
                {isExpanded && hasPayload && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {log.old_data && (
                      <div className="p-2.5 bg-red-50/60 rounded-lg border border-red-100">
                        <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">
                          Data Sebelum (Old)
                        </span>
                        <pre className="text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_data && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                          Data Sesudah (New)
                        </span>
                        <pre className="text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.new_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
