import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';
import type { Product, Category, Unit, DayOfWeek } from '../../../types/database.types';
import { editProduct, INDONESIAN_DAYS } from '../../../lib/db';
import { useAppStore } from '../../../stores/appStore';
import { Info } from 'lucide-react';

const editProductSchema = z.object({
  name: z.string().min(2, 'Nama barang wajib diisi'),
  sku: z.string().optional(),
  category_id: z.string().min(1, 'Pilih kategori'),
  subcategory: z.string().optional(),
  unit_id: z.string().min(1, 'Pilih satuan'),
  stock: z.coerce.number().min(0, 'Stok sistem tidak boleh negatif'),
  minimum_stock: z.coerce.number().min(0, 'Batas minimum tidak boleh negatif'),
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
        sku: product.sku || '',
        category_id: product.category_id,
        subcategory: product.subcategory || '',
        unit_id: product.unit_id,
        stock: product.stock,
        minimum_stock: product.minimum_stock,
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
        sku: data.sku,
        category_id: data.category_id,
        subcategory: data.subcategory,
        unit_id: data.unit_id,
        stock: data.stock,
        minimum_stock: data.minimum_stock,
        notes: data.notes,
        inspection_days: selectedDays,
      });
      showToast(`Data barang "${data.name}" berhasil diubah (Versi tetap v${product.current_price_version})`);
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
      title="Edit Data Barang"
      subtitle={`Mengubah informasi master barang (Price Version tetap v${product.current_price_version})`}
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
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Version Notice per BR-03 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">
              Aturan Sistem (BR-03):{' '}
            </span>
            Edit hanya untuk metadata barang. Versi harga tetap{' '}
            <Badge variant="version">v{product.current_price_version}</Badge>. Untuk mengubah harga resmi gunakan menu <strong>Update Harga</strong>.
          </div>
        </div>

        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nama Barang"
              required
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div>
            <Input
              label="SKU / Kode"
              error={errors.sku?.message}
              {...register('sku')}
            />
          </div>
        </div>

        {/* Category, Subcategory, Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Select
              label="Kategori"
              required
              error={errors.category_id?.message}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              {...register('category_id')}
            />
          </div>
          <div>
            <Input
              label="Subkategori"
              error={errors.subcategory?.message}
              {...register('subcategory')}
            />
          </div>
          <div>
            <Select
              label="Satuan"
              required
              error={errors.unit_id?.message}
              options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
              {...register('unit_id')}
            />
          </div>
        </div>

        {/* System Stock Adjustment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Koreksi Stok Sistem"
            type="number"
            error={errors.stock?.message}
            helperText="Penyesuaian resmi stok gudang oleh Admin"
            {...register('stock')}
          />
          <Input
            label="Batas Minimum Stok"
            type="number"
            error={errors.minimum_stock?.message}
            helperText="Batas notifikasi peringatan menipis"
            {...register('minimum_stock')}
          />
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
            Catatan Operasional
          </label>
          <textarea
            rows={2}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
};
