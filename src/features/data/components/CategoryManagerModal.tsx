import React, { useState } from 'react';
import type { Category } from '../../../types/database.types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { addCategory } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { FolderPlus, FolderTree } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const { showToast } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await addCategory(name.trim(), description.trim() || undefined);
      showToast(`Kategori "${name}" berhasil ditambahkan`);
      setName('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Kategori Barang"
      subtitle="Kategori master produk untuk toko Haidar Plastik"
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
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            Tambah Kategori Baru
          </div>
          <Input
            placeholder="Nama Kategori (contoh: Plastik Klip)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Deskripsi singkat (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" type="submit" isLoading={loading} disabled={!name.trim()}>
              + Tambah Kategori
            </Button>
          </div>
        </form>

        {/* Existing categories list */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            Daftar Kategori Aktif ({categories.length})
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
            {categories.map((c) => (
              <div key={c.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.name}</div>
                  {c.description && (
                    <div className="text-[11px] text-slate-400 mt-0.5">{c.description}</div>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
