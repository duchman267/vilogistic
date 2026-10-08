import React, { useState } from 'react';
import {
  STTBFormData,
  STTBItem,
  SatuanBarang,
  JenisLayanan,
  MetodePembayaran,
  StatusPembayaran,
  ValidationErrors,
} from '../types/sttb';
import { Branch } from '../types/settings';
import {
  createInitialSTTBItem,
  formatRupiah,
} from '../utils/sttbStorage';
import {
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Printer,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Eye,
  Settings,
} from 'lucide-react';

interface STTBFormProps {
  formData: STTBFormData;
  onChange: (data: STTBFormData) => void;
  onPreview: () => void;
  onSave: (andPrint?: boolean) => void;
  onSaveDraft?: () => void;
  onReset: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  validationErrors: ValidationErrors;
  branches?: Branch[];
  onNavigateToSettings?: () => void;
}

const SATUAN_OPTIONS: SatuanBarang[] = ['Koli', 'Box', 'Pcs', 'Unit', 'Karung', 'Lainnya'];
const LAYANAN_OPTIONS: JenisLayanan[] = ['REGULER', 'EXPRESS', 'CARGO', 'LAINNYA'];
const METODE_OPTIONS: MetodePembayaran[] = ['CASH', 'TRANSFER', 'QRIS', 'CREDIT'];
const STATUS_OPTIONS: StatusPembayaran[] = ['LUNAS', 'SEBAGIAN', 'BELUM BAYAR'];

export const STTBForm: React.FC<STTBFormProps> = ({
  formData,
  onChange,
  onPreview,
  onSave,
  onSaveDraft,
  onReset,
  isEditing = false,
  onCancelEdit,
  validationErrors,
  branches = [],
  onNavigateToSettings,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Recalculate totals helper
  const updateLayananAndBiaya = (
    field: keyof STTBFormData['layanan'],
    value: any
  ) => {
    const updatedLayanan = { ...formData.layanan, [field]: value };
    const ongkos = Number(updatedLayanan.ongkosKirim) || 0;
    const packing = Number(updatedLayanan.packing) || 0;
    const asuransi = Number(updatedLayanan.asuransi) || 0;
    const handling = Number(updatedLayanan.handling) || 0;
    const biayaLain = Number(updatedLayanan.biayaLain) || 0;
    const diskon = Number(updatedLayanan.diskon) || 0;

    const total = Math.max(0, ongkos + packing + asuransi + handling + biayaLain - diskon);
    updatedLayanan.totalBiaya = total;

    // Also adjust payment remaining balance
    const updatedPembayaran = { ...formData.pembayaran };
    if (updatedPembayaran.statusPembayaran === 'LUNAS') {
      updatedPembayaran.jumlahDibayar = total;
      updatedPembayaran.sisaPembayaran = 0;
    } else {
      const bayar = Number(updatedPembayaran.jumlahDibayar) || 0;
      updatedPembayaran.sisaPembayaran = Math.max(0, total - bayar);
    }

    onChange({
      ...formData,
      layanan: updatedLayanan,
      pembayaran: updatedPembayaran,
    });
  };

  const updatePembayaran = (field: keyof STTBFormData['pembayaran'], value: any) => {
    const updatedPembayaran = { ...formData.pembayaran, [field]: value };
    const total = formData.layanan.totalBiaya;

    if (field === 'statusPembayaran') {
      if (value === 'LUNAS') {
        updatedPembayaran.jumlahDibayar = total;
        updatedPembayaran.sisaPembayaran = 0;
      } else if (value === 'BELUM BAYAR') {
        updatedPembayaran.jumlahDibayar = 0;
        updatedPembayaran.sisaPembayaran = total;
      } else if (value === 'SEBAGIAN') {
        if (updatedPembayaran.jumlahDibayar >= total || updatedPembayaran.jumlahDibayar === 0) {
          updatedPembayaran.jumlahDibayar = Math.round(total / 2);
        }
        updatedPembayaran.sisaPembayaran = Math.max(0, total - updatedPembayaran.jumlahDibayar);
      }
    } else if (field === 'jumlahDibayar') {
      const bayar = Math.max(0, Number(value) || 0);
      updatedPembayaran.jumlahDibayar = bayar;
      if (bayar >= total && total > 0) {
        updatedPembayaran.statusPembayaran = 'LUNAS';
        updatedPembayaran.sisaPembayaran = 0;
      } else {
        updatedPembayaran.sisaPembayaran = Math.max(0, total - bayar);
        if (bayar > 0) {
          updatedPembayaran.statusPembayaran = 'SEBAGIAN';
        } else {
          updatedPembayaran.statusPembayaran = 'BELUM BAYAR';
        }
      }
    }

    onChange({
      ...formData,
      pembayaran: updatedPembayaran,
    });
  };

  // Item handlers
  const handleAddItem = () => {
    const newItems = [...formData.items, createInitialSTTBItem()];
    onChange({ ...formData, items: newItems });
  };

  const handleUpdateItem = (index: number, field: keyof STTBItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...formData, items: newItems });
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      // Keep at least one empty item
      onChange({
        ...formData,
        items: [
          {
            id: 'item_' + Date.now(),
            keterangan: '',
            jumlah: 1,
            satuan: 'Koli',
            berat: 1,
          },
        ],
      });
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    onChange({ ...formData, items: newItems });
  };

  // Totals for items
  const totalKoli = formData.items.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
  const totalBerat = formData.items.reduce((sum, item) => sum + (Number(item.berat) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs p-5 md:p-6 space-y-6">
      {/* Header and Reset Action */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#0B1F4D] tracking-tight">
              {isEditing ? 'Edit Surat Tanda Terima Barang' : 'Buat Surat Tanda Terima Barang'}
            </h2>
            {isEditing && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                Mode Edit
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Isi data penerimaan barang untuk membuat surat tanda terima resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              Batal Edit
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-red-700 rounded border border-slate-300 transition-colors"
              title="Reset seluruh formulir"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            {/* Reset confirmation popover */}
            {showResetConfirm && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-slate-300 rounded shadow-lg z-30 text-xs">
                <p className="font-semibold text-slate-900 mb-1">Konfirmasi Reset?</p>
                <p className="text-slate-500 mb-3 text-[11px]">
                  Data formulir yang belum disimpan akan dikosongkan. Riwayat STTB tersimpan tidak akan terhapus.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      onReset();
                    }}
                    className="px-2.5 py-1 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                  >
                    Ya, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: Informasi STTB */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            1
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Informasi STTB
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              No. STTB <span className="text-emerald-600 text-[10px]">(Otomatis)</span>
            </label>
            <input
              type="text"
              readOnly
              value={formData.nomorSTTB}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-[#0B1F4D] focus:outline-hidden cursor-default"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Penerimaan *
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => onChange({ ...formData, tanggal: e.target.value })}
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.tanggal ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.tanggal && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.tanggal}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jam *</label>
            <input
              type="time"
              value={formData.jam}
              onChange={(e) => onChange({ ...formData, jam: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cabang <span className="text-red-500">*</span>
            </label>
            {branches.filter((b) => b.status === 'Aktif').length > 0 ? (
              <select
                value={formData.cabang}
                onChange={(e) => onChange({ ...formData, cabang: e.target.value })}
                className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                  validationErrors.cabang ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                }`}
              >
                {!formData.cabang && <option value="">-- Pilih Cabang --</option>}
                {branches
                  .filter((b) => b.status === 'Aktif')
                  .map((b) => (
                    <option key={b.id} value={b.nama}>
                      {b.kode ? `${b.kode} - ${b.nama}` : b.nama} {b.isDefault ? '(Utama)' : ''}
                    </option>
                  ))}
                {/* Keep existing branch option if editing old STTB and branch is now inactive */}
                {formData.cabang &&
                  !branches.some((b) => b.status === 'Aktif' && b.nama === formData.cabang) && (
                    <option value={formData.cabang}>{formData.cabang} (Tersimpan)</option>
                  )}
              </select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Nama Cabang"
                  value={formData.cabang}
                  onChange={(e) => onChange({ ...formData, cabang: e.target.value })}
                  className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                    validationErrors.cabang ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {onNavigateToSettings && (
                  <button
                    type="button"
                    onClick={onNavigateToSettings}
                    className="text-[10px] text-[#FF7A00] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>+ Kelola cabang di Pengaturan</span>
                  </button>
                )}
              </div>
            )}
            {validationErrors.cabang && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.cabang}</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Data Pengirim */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            2
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Data Pengirim
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Pengirim <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={formData.pengirim.nama}
              onChange={(e) =>
                onChange({
                  ...formData,
                  pengirim: { ...formData.pengirim, nama: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.pengirimNama ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.pengirimNama && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.pengirimNama}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kontak / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={formData.pengirim.kontak}
              onChange={(e) =>
                onChange({
                  ...formData,
                  pengirim: { ...formData.pengirim, kontak: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.pengirimKontak ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.pengirimKontak && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.pengirimKontak}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Perusahaan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: PT Sumber Berkah"
              value={formData.pengirim.perusahaan}
              onChange={(e) =>
                onChange({
                  ...formData,
                  pengirim: { ...formData.pengirim, perusahaan: e.target.value },
                })
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Pengirim <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap penyerahan barang..."
              value={formData.pengirim.alamat}
              onChange={(e) =>
                onChange({
                  ...formData,
                  pengirim: { ...formData.pengirim, alamat: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.pengirimAlamat ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.pengirimAlamat && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.pengirimAlamat}</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: Data Penerima */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            3
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Data Penerima
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Penerima <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Rina Wijaya"
              value={formData.penerima.nama}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, nama: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.penerimaNama ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.penerimaNama && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.penerimaNama}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kontak / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 085712345678"
              value={formData.penerima.kontak}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, kontak: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.penerimaKontak ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.penerimaKontak && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.penerimaKontak}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Perusahaan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Toko Maju Jaya"
              value={formData.penerima.perusahaan}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, perusahaan: e.target.value },
                })
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Lengkap Penerima <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Alamat lengkap penerima..."
              value={formData.penerima.alamat}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, alamat: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.penerimaAlamat ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.penerimaAlamat && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.penerimaAlamat}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kota Tujuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Surabaya"
              value={formData.penerima.kotaTujuan}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, kotaTujuan: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.kotaTujuan ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.kotaTujuan && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.kotaTujuan}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Provinsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Jawa Timur"
              value={formData.penerima.provinsi}
              onChange={(e) =>
                onChange({
                  ...formData,
                  penerima: { ...formData.penerima, provinsi: e.target.value },
                })
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                validationErrors.provinsi ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.provinsi && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.provinsi}</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: Detail Barang */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
              4
            </span>
            <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
              Detail Barang
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 text-xs font-bold text-[#0B1F4D] bg-[#0B1F4D]/5 hover:bg-[#0B1F4D]/10 px-2.5 py-1 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>+ Tambah Barang</span>
          </button>
        </div>

        {validationErrors.items && (
          <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationErrors.items}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-xs">
            <thead className="bg-[#0B1F4D] text-white">
              <tr>
                <th className="py-2 px-2 text-center w-10">No.</th>
                <th className="py-2 px-3 text-left">Jenis / Keterangan Barang *</th>
                <th className="py-2 px-2 text-center w-24">Jumlah *</th>
                <th className="py-2 px-2 text-center w-28">Satuan</th>
                <th className="py-2 px-2 text-right w-28">Berat (Kg) *</th>
                <th className="py-2 px-2 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {formData.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center font-mono text-slate-500">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="Contoh: Pakaian Jadi / Sparepart"
                      value={item.keterangan}
                      onChange={(e) => handleUpdateItem(index, 'keterangan', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={1}
                      value={item.jumlah === 0 ? '' : item.jumlah}
                      onChange={(e) =>
                        handleUpdateItem(index, 'jumlah', Math.max(1, parseInt(e.target.value, 10) || 0))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-center font-semibold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={item.satuan}
                      onChange={(e) =>
                        handleUpdateItem(index, 'satuan', e.target.value as SatuanBarang)
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-center focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
                    >
                      {SATUAN_OPTIONS.map((satuan) => (
                        <option key={satuan} value={satuan}>
                          {satuan}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={item.berat === 0 ? '' : item.berat}
                      onChange={(e) =>
                        handleUpdateItem(index, 'berat', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-right font-medium focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Hapus baris barang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F5F7FA] font-bold text-slate-900 border-t border-slate-300">
              <tr>
                <td colSpan={2} className="py-2 px-3 text-right text-[11px] uppercase">
                  Total Terhitung Otomatis:
                </td>
                <td className="py-2 px-2 text-center text-[#0B1F4D] font-extrabold">
                  {totalKoli}
                </td>
                <td className="py-2 px-2 text-center text-slate-500 text-[10px]">
                  Koli / Satuan
                </td>
                <td className="py-2 px-2 text-right text-[#0B1F4D] font-extrabold">
                  {totalBerat.toLocaleString('id-ID')} Kg
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* SECTION 5: Layanan dan Biaya */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            5
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Layanan dan Biaya
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.layanan.jenisLayanan}
              onChange={(e) =>
                updateLayananAndBiaya('jenisLayanan', e.target.value as JenisLayanan)
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            >
              {LAYANAN_OPTIONS.map((layanan) => (
                <option key={layanan} value={layanan}>
                  {layanan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ongkos Kirim (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.ongkosKirim || ''}
              onChange={(e) =>
                updateLayananAndBiaya('ongkosKirim', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden ${
                validationErrors.ongkosKirim ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {validationErrors.ongkosKirim && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{validationErrors.ongkosKirim}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Packing (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.packing || ''}
              onChange={(e) =>
                updateLayananAndBiaya('packing', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asuransi (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.asuransi || ''}
              onChange={(e) =>
                updateLayananAndBiaya('asuransi', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Handling (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.handling || ''}
              onChange={(e) =>
                updateLayananAndBiaya('handling', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Biaya Lain (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.biayaLain || ''}
              onChange={(e) =>
                updateLayananAndBiaya('biayaLain', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Diskon (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.layanan.diskon || ''}
              onChange={(e) =>
                updateLayananAndBiaya('diskon', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-emerald-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Prominent Total Display */}
          <div className="bg-[#FF7A00]/10 border-2 border-[#FF7A00] rounded p-2.5 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold uppercase text-[#0B1F4D] tracking-wide">
              TOTAL BIAYA AKHIR
            </span>
            <span className="text-base font-black text-[#FF7A00] tracking-tight">
              {formatRupiah(formData.layanan.totalBiaya)}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 6: Pembayaran */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            6
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Pembayaran
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Metode Pembayaran <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.pembayaran.metodePembayaran}
              onChange={(e) =>
                updatePembayaran('metodePembayaran', e.target.value as MetodePembayaran)
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            >
              {METODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Pembayaran <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.pembayaran.statusPembayaran}
              onChange={(e) =>
                updatePembayaran('statusPembayaran', e.target.value as StatusPembayaran)
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jumlah Dibayar (Rp)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={formData.pembayaran.jumlahDibayar || ''}
              onChange={(e) =>
                updatePembayaran('jumlahDibayar', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sisa Pembayaran (Rp) <span className="text-slate-400 font-normal">(Otomatis)</span>
            </label>
            <input
              type="text"
              readOnly
              value={formatRupiah(formData.pembayaran.sisaPembayaran)}
              className={`w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-bold cursor-default ${
                formData.pembayaran.sisaPembayaran > 0 ? 'text-red-600' : 'text-slate-700'
              }`}
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: Catatan */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B1F4D] text-white font-bold text-xs">
            7
          </span>
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
            Catatan Tambahan
          </h3>
        </div>

        <div>
          <textarea
            rows={3}
            placeholder="Catatan tambahan (contoh: Barang fragile / simpan di tempat kering / penerima harap dihubungi sebelum antar)..."
            value={formData.catatan}
            onChange={(e) => onChange({ ...formData, catatan: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-[#0B1F4D] focus:outline-hidden"
          />
        </div>
      </section>

      {/* BOTTOM ACTION BAR */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors shadow-2xs"
          >
            <FileCheck className="w-4 h-4 text-slate-500" />
            <span>Simpan Draft</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSave(false)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors shadow-2xs"
        >
          <Save className="w-4 h-4 text-white" />
          <span>{isEditing ? 'Perbarui STTB' : 'Simpan STTB'}</span>
        </button>

        {/* Dedicated Preview Button */}
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0B1F4D] bg-white hover:bg-slate-50 rounded border-2 border-[#0B1F4D] transition-colors shadow-2xs"
          title="Pratinjau Surat Tanda Terima Barang"
        >
          <Eye className="w-4 h-4 text-[#FF7A00]" />
          <span>Preview</span>
        </button>

        {/* Primary Action in Vilogistic Orange */}
        <button
          type="button"
          onClick={() => onSave(true)}
          className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-[#FF7A00] hover:bg-[#E56E00] rounded transition-all shadow-sm active:scale-[0.98]"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>Simpan & Cetak STTB</span>
        </button>
      </div>
    </div>
  );
};
