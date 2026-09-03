import React from 'react';
import type { StockCheckEditRequest } from '../../../types/database.types';
import { formatDateTime } from '../../../lib/datetime';
import { approveStockCheckEdit, rejectStockCheckEdit } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { FileQuestion, Check, X, Clock, User, ShieldCheck } from 'lucide-react';

interface EditRequestTabProps {
  requests: (StockCheckEditRequest & { product_name?: string })[];
  onRefresh: () => void;
}

export const EditRequestTab: React.FC<EditRequestTabProps> = ({ requests, onRefresh }) => {
  const { showToast } = useAppStore();

  const handleApprove = async (req: StockCheckEditRequest & { product_name?: string }) => {
    try {
      await approveStockCheckEdit(req.stock_check_id);
      showToast(`Permintaan edit "${req.product_name}" telah disetujui`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui permintaan', 'error');
    }
  };

  const handleReject = async (req: StockCheckEditRequest & { product_name?: string }) => {
    try {
      await rejectStockCheckEdit(req.stock_check_id);
      showToast(`Permintaan edit "${req.product_name}" ditolak`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak permintaan', 'error');
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-2">
        <FileQuestion className="w-8 h-8 text-slate-300 mx-auto" />
        <p>Tidak ada permintaan edit pemeriksaan stok dari staf.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isPending = req.status === 'PENDING';
        const isApproved = req.status === 'APPROVED';

        return (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {req.product_name}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {isPending
                      ? '⏳ Menunggu Persetujuan'
                      : isApproved
                      ? '✓ Disetujui'
                      : '✕ Ditolak'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pemohon: <strong className="text-slate-700">{req.requested_by}</strong></span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(req.created_at)}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {isPending && (
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reason Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                Alasan Pengajuan Koreksi:
              </span>
              <p className="text-slate-800 italic font-sans">
                "{req.reason}"
              </p>
            </div>

            {/* Review Decision Details */}
            {!isPending && req.reviewed_by && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                <span className="flex items-center gap-1 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ditinjau oleh: <strong>{req.reviewed_by}</strong></span>
                </span>
                <span>
                  Waktu putusan: {formatDateTime(req.reviewed_at)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
