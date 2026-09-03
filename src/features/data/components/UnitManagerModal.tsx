import React, { useState } from 'react';
import type { Unit } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { addUnit } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { PlusCircle, Ruler } from 'lucide-react';

interface UnitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  onSuccess: () => void;
}

export const UnitManagerModal: React.FC<UnitManagerModalProps> = ({
  isOpen,
  onClose,
  units,
  onSuccess,
}) => {
  const { showToast } = useAppStore();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) return;

    try {
      setLoading(true);
      await addUnit(name.trim(), symbol.trim().toUpperCase());
      showToast(`Satuan "${symbol.toUpperCase()}" berhasil ditambahkan`);
      setName('');
      setSymbol('');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan satuan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Satuan Barang"
      subtitle="Master data satuan produk (PCS, PACK, DUS, KG, dll)"
      maxWidth="md"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Selesai
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Add Form */}
        <form onSubmit={handleAdd} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Tambah Satuan Baru
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input
                placeholder="Nama Satuan (contoh: Lembar)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Simbol (LBR)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={loading}
              disabled={!name.trim() || !symbol.trim()}
            >
              + Tambah Satuan
            </Button>
          </div>
        </form>

        {/* Existing units list */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            Daftar Satuan Aktif ({units.length})
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {units.map((u) => (
              <div
                key={u.id}
                className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{u.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Simbol: {u.symbol}</div>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {u.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
