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
    <div className="space-y-3 font-sans">
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E2DA] p-12 text-center text-xs text-[#75726B]">
          Belum ada catatan aktivitas admin.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E2DA] divide-y divide-[#EAE8E2] shadow-2xs overflow-hidden">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const hasPayload = Boolean(log.old_data || log.new_data);

            return (
              <div key={log.id} className="p-4 hover:bg-[#FAF9F5] transition-colors">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => hasPayload && toggleExpand(log.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F5F4EE] text-[#121214] uppercase border border-[#E5E2DA]">
                        {log.action}
                      </span>
                      <span className="text-xs text-[#85827B]">•</span>
                      <span className="text-xs font-medium text-[#605D57] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        {log.user_name}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#121214] leading-snug">
                      {log.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#75726B] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#85827B]" />
                      {formatDateTime(log.created_at)}
                    </span>
                    {hasPayload && (
                      <button
                        type="button"
                        className="p-1 rounded text-[#85827B] hover:text-[#121214] cursor-pointer"
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
                  <div className="mt-3 pt-3 border-t border-[#EAE8E2] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {log.old_data && (
                      <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                          Sebelum
                        </span>
                        <pre className="text-[11px] text-[#33312E] overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_data && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                          Sesudah
                        </span>
                        <pre className="text-[11px] text-[#33312E] overflow-x-auto whitespace-pre-wrap">
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
