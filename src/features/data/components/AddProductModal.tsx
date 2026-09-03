import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import type { Category, Unit, DayOfWeek } from '../../../types/database.types';
import { addProduct, INDONESIAN_DAYS } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';

const addProductSchema = z.object({
  name: z.string().min(2, 'Nama barang wajib diisi (min 2 karakter)'),
  category_id: z.string().min(1, 'Pilih kategori'),
  unit_id: z.string().min(1, 'Pilih satuan'),
  purchase_price: z.coerce.number().min(0, 'Harga modal tidak boleh negatif'),
  selling_price: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  notes: z.string().optional(),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  onSuccess: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  onSuccess,
}) => {
  const { showToast } = useAppStore();
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Senin', 'Rabu', 'Sabtu']);

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        showToast('Pilih minimal 1 hari jadwal pemeriksaan', 'info');
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema) as any,
    defaultValues: {
      purchase_price: 0,
      selling_price: 0,
    },
  });

  const onSubmit = async (data: AddProductFormData) => {
    try {
      const created = await addProduct({
        name: data.name,
        category_id: data.category_id,
        unit_id: data.unit_id,
        purchase_price: data.purchase_price,
        selling_price: data.selling_price,
        notes: data.notes,
        inspection_days: selectedDays,
      });
      showToast(`Barang "${data.name}" (${created.sku || 'SKU Auto'}) berhasil ditambahkan (v1)`);
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan barang', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Barang Baru"
      subtitle="Barang baru akan otomatis mulai pada Price Version v1"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            Simpan Barang (v1)
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <Input
            label="Nama Barang"
            placeholder="Contoh: Plastik HD 15x30 Bening"
            required
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Kategori"
              required
              error={errors.category_id?.message}
              options={[
                { value: '', label: '-- Pilih Kategori --' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              {...register('category_id')}
            />
          </div>
          <div>
            <Select
              label="Satuan"
              required
              error={errors.unit_id?.message}
              options={[
                { value: '', label: '-- Pilih Satuan --' },
                ...units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` })),
              ]}
              {...register('unit_id')}
            />
          </div>
        </div>

        {/* Pricing (Modal & Jual) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs font-bold uppercase text-slate-500 mb-2">
            Penetapan Harga Awal
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Harga Modal (Rp)"
              type="number"
              prefixText="Rp"
              required
              error={errors.purchase_price?.message}
              helperText="Hanya terlihat oleh Admin (BR-12)"
              {...register('purchase_price')}
            />
            <Input
              label="Harga Jual (Rp)"
              type="number"
              prefixText="Rp"
              required
              error={errors.selling_price?.message}
              helperText="Harga resmi toko ke konsumen"
              {...register('selling_price')}
            />
          </div>
        </div>

        {/* Inspection Schedule (PRD User Module Section 13-14) */}
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <label className="block text-xs font-bold text-indigo-950 mb-1.5">
            Jadwal Pemeriksaan Harian (Staf User)
          </label>
          <p className="text-[11px] text-indigo-700/80 mb-2">
            Pilih hari barang ini harus diperiksa fisik oleh User:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INDONESIAN_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Barang (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Keterangan isi per pack, spesifikasi bahan, atau supplier..."
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
};
