import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import type { Product, Category, Unit, DayOfWeek } from '../../../types/database.types';
import { editProduct, INDONESIAN_DAYS } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';

const editProductSchema = z.object({
  name: z.string().min(2, 'Nama barang wajib diisi'),
  category_id: z.string().min(1, 'Pilih kategori'),
  unit_id: z.string().min(1, 'Pilih satuan'),
  notes: z.string().optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  onSuccess: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
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
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema) as any,
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category_id: product.category_id,
        unit_id: product.unit_id,
        notes: product.notes || '',
      });
      setSelectedDays(product.inspection_days || ['Senin', 'Rabu', 'Sabtu']);
    }
  }, [product, reset]);

  if (!product) return null;

  const onSubmit = async (data: EditProductFormData) => {
    try {
      await editProduct(product.id, {
        name: data.name,
        category_id: data.category_id,
        unit_id: data.unit_id,
        notes: data.notes,
        inspection_days: selectedDays,
      });
      showToast(`Data barang "${data.name}" berhasil diperbarui`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah data barang', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Barang"
      subtitle={`Versi Harga: v${product.current_price_version}`}
      maxWidth="md"
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
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Nama Barang"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Kategori"
            required
            error={errors.category_id?.message}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            {...register('category_id')}
          />
          <Select
            label="Satuan"
            required
            error={errors.unit_id?.message}
            options={units.map((u) => ({ value: u.id, label: u.name }))}
            {...register('unit_id')}
          />
        </div>

        {/* Inspection Schedule */}
        <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2DA]">
          <label className="block text-xs font-bold text-[#121214] mb-1">
            Jadwal Pemeriksaan Fisik
          </label>
          <p className="text-[11px] text-[#75726B] mb-2.5">
            Pilih hari pemeriksaan berkala untuk staf toko:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INDONESIAN_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121214] text-white border-[#121214] shadow-2xs'
                      : 'bg-white text-[#605D57] border-[#D5D2C9] hover:bg-[#F5F4EE]'
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
          <label className="block text-xs font-semibold text-[#33312E] mb-1">
            Catatan Tambahan
          </label>
          <textarea
            rows={2}
            placeholder="Keterangan spesifikasi atau lokasi rak..."
            className="w-full text-xs rounded-lg border border-[#D5D2C9] p-2.5 bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none placeholder-[#A8A49C]"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
};
