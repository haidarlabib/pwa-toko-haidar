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
      showToast(`Barang "${data.name}" berhasil ditambahkan (${created.sku || 'SKU Dibuat'})`, 'success');
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
      subtitle="Mendaftarkan produk baru ke katalog toko"
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
            Simpan Barang
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Nama Barang"
          placeholder="Contoh: Plastik HD 15x30 Bening"
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
            options={[
              { value: '', label: '-- Pilih Kategori --' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            {...register('category_id')}
          />
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

        {/* Pricing (Modal & Jual) */}
        <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2DA] space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#75726B]">
            Penetapan Harga
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Harga Modal"
              type="number"
              prefixText="Rp"
              required
              error={errors.purchase_price?.message}
              {...register('purchase_price')}
            />
            <Input
              label="Harga Jual Resmi"
              type="number"
              prefixText="Rp"
              required
              error={errors.selling_price?.message}
              {...register('selling_price')}
            />
          </div>
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
            Catatan (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Keterangan spesifikasi barang atau kemasan..."
            className="w-full text-xs rounded-lg border border-[#D5D2C9] p-2.5 bg-[#FAF9F5] text-[#121214] focus:bg-white focus:border-[#121214] focus:ring-1 focus:ring-[#121214] outline-none placeholder-[#A8A49C]"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
};
