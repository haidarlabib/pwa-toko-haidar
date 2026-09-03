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
      showToast(`Permintaan edit "${req.product_name}" disetujui`, 'success');
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
      <div className="bg-white rounded-xl border border-[#E5E2DA] p-12 text-center text-xs text-[#75726B] space-y-2 font-sans">
        <FileQuestion className="w-8 h-8 text-[#85827B] mx-auto" />
        <p>Tidak ada permintaan edit pemeriksaan fisik dari staf.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {requests.map((req) => {
        const isPending = req.status === 'PENDING';
        const isApproved = req.status === 'APPROVED';

        return (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-[#E5E2DA] p-4 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#121214]">
                    {req.product_name}
                  </h4>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isPending
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : isApproved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {isPending
                      ? 'Menunggu Persetujuan'
                      : isApproved
                      ? 'Disetujui'
                      : 'Ditolak'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#75726B] mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#85827B]" />
                    <span>Pemohon: <strong className="text-[#121214]">{req.requested_by}</strong></span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#85827B]" />
                    <span>{formatDateTime(req.created_at)}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {isPending && (
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE8E2]">
                  <button
                    onClick={() => handleReject(req)}
                    className="px-3 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-3 py-1.5 rounded-md bg-[#121214] hover:bg-[#2A2A2E] text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reason Box */}
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E5E2DA] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#75726B] block tracking-wider mb-0.5">
                Alasan Pengajuan Koreksi:
              </span>
              <p className="text-[#33312E] italic">
                "{req.reason}"
              </p>
            </div>

            {/* Review Decision Details */}
            {!isPending && req.reviewed_by && (
              <div className="flex items-center justify-between text-[11px] text-[#75726B] pt-1 border-t border-[#EAE8E2] font-mono">
                <span className="flex items-center gap-1 text-[#121214]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
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
