import React, { useState, useRef } from 'react';
import { CompanySettings, Branch } from '../types/settings';
import {
  Building2,
  Image as ImageIcon,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Save,
  Upload,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Globe,
  Sliders,
} from 'lucide-react';

interface SettingsViewProps {
  companySettings: CompanySettings;
  branches: Branch[];
  onSaveCompanySettings: (settings: CompanySettings) => void;
  onAddBranch: (branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBranch: (id: string, branchData: Partial<Branch>) => void;
  onDeleteBranch: (id: string) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companySettings,
  branches,
  onSaveCompanySettings,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  showToast,
}) => {
  // Local state for company settings form
  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Sync state when companySettings prop changes
  React.useEffect(() => {
    setFormData(companySettings);
  }, [companySettings]);

  // Branch Modal State (Add / Edit)
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState<{
    kode: string;
    nama: string;
    alamat: string;
    telepon: string;
    status: 'Aktif' | 'Nonaktif';
    isDefault: boolean;
  }>({
    kode: '',
    nama: '',
    alamat: '',
    telepon: '',
    status: 'Aktif',
    isDefault: false,
  });
  const [branchFormError, setBranchFormError] = useState<string | null>(null);

  // Delete Branch Confirmation Modal State
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGO UPLOAD & REMOVE HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 3MB)
    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran file logo maksimal 3MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        logo: result,
      }));
      showToast('Logo berhasil dimuat. Klik "Simpan Perubahan" untuk menyimpan permanen.', 'info');
    };
    reader.onerror = () => {
      showToast('Gagal membaca file gambar logo.', 'error');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));
    showToast('Logo dihapus dari konfigurasi.', 'info');
  };

  // --- SAVE COMPANY SETTINGS ---
  const handleSaveCompany = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.namaPerusahaan.trim()) {
      setFormErrors({ namaPerusahaan: 'Nama Perusahaan wajib diisi.' });
      showToast('Nama Perusahaan wajib diisi.', 'error');
      return;
    }

    setFormErrors({});
    onSaveCompanySettings(formData);
    showToast('Pengaturan berhasil disimpan.', 'success');
  };

  // --- BRANCH MODAL HANDLERS ---
  const openAddBranchModal = () => {
    setEditingBranchId(null);
    setBranchForm({
      kode: '',
      nama: '',
      alamat: '',
      telepon: '',
      status: 'Aktif',
      isDefault: branches.length === 0, // Auto default if first branch
    });
    setBranchFormError(null);
    setBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setBranchForm({
      kode: branch.kode,
      nama: branch.nama,
      alamat: branch.alamat,
      telepon: branch.telepon,
      status: branch.status,
      isDefault: branch.isDefault,
    });
    setBranchFormError(null);
    setBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKode = branchForm.kode.trim().toUpperCase();
    const cleanNama = branchForm.nama.trim();

    if (!cleanKode) {
      setBranchFormError('Kode Cabang wajib diisi.');
      return;
    }
    if (!cleanNama) {
      setBranchFormError('Nama Cabang wajib diisi.');
      return;
    }

    // Check duplicate code
    const isDuplicate = branches.some(
      (b) => b.id !== editingBranchId && b.kode.trim().toUpperCase() === cleanKode
    );
    if (isDuplicate) {
      setBranchFormError(`Kode Cabang "${cleanKode}" sudah digunakan cabang lain.`);
      return;
    }

    try {
      if (editingBranchId) {
        onUpdateBranch(editingBranchId, {
          kode: cleanKode,
          nama: cleanNama,
          alamat: branchForm.alamat.trim(),
          telepon: branchForm.telepon.trim(),
          status: branchForm.status,
          isDefault: branchForm.isDefault,
        });
        showToast(`Cabang ${cleanNama} berhasil diperbarui.`);
      } else {
        onAddBranch({
          kode: cleanKode,
          nama: cleanNama,
          alamat: branchForm.alamat.trim(),
          telepon: branchForm.telepon.trim(),
          status: branchForm.status,
          isDefault: branchForm.isDefault,
        });
        showToast(`Cabang ${cleanNama} berhasil ditambahkan.`);
      }
      setBranchModalOpen(false);
    } catch (err: any) {
      setBranchFormError(err.message || 'Gagal menyimpan cabang.');
    }
  };

  const handleConfirmDeleteBranch = () => {
    if (!branchToDelete) return;
    onDeleteBranch(branchToDelete.id);
    showToast(`Cabang ${branchToDelete.nama} berhasil dihapus.`);
    setBranchToDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. PAGE HEADER */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1F4D] tracking-tight">
            Pengaturan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola informasi perusahaan, logo, dan cabang yang digunakan pada Surat Tanda Terima Barang.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleSaveCompany()}
          className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-[#FF7A00] hover:bg-[#E56E00] rounded shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* 2. SECTION: INFORMASI PERUSAHAAN */}
      <section className="bg-white border border-slate-200 rounded-md p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded bg-[#0B1F4D]/10 text-[#0B1F4D]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
              Informasi Perusahaan
            </h3>
            <p className="text-[11px] text-slate-500">
              Data ini akan muncul di bagian kop surat / header Surat Tanda Terima Barang (STTB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Perusahaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Vilogistic"
              value={formData.namaPerusahaan}
              onChange={(e) => {
                setFormData({ ...formData, namaPerusahaan: e.target.value });
                if (formErrors.namaPerusahaan) setFormErrors({});
              }}
              className={`w-full bg-white border rounded px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D] ${
                formErrors.namaPerusahaan ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.namaPerusahaan && (
              <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.namaPerusahaan}</span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: 021-750-8899 atau 08123456789"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="Contoh: cs@vilogistic.co.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website</label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: www.vilogistic.co.id"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Kantor Pusat / Perusahaan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jl. Soekarno Hatta No. 450, Bandung, Jawa Barat"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
          </div>
        </div>
      </section>

      {/* 3. SECTION: LOGO PERUSAHAAN */}
      <section className="bg-white border border-slate-200 rounded-md p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded bg-[#0B1F4D]/10 text-[#0B1F4D]">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
              Logo Perusahaan
            </h3>
            <p className="text-[11px] text-slate-500">
              Unggah logo resmi perusahaan untuk ditampilkan pada Surat Tanda Terima Barang (STTB).
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/svg+xml"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {formData.logo ? (
          <div className="space-y-4">
            {/* Logo Preview Box */}
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pratinjau Logo Pada Dokumen
              </span>
              <div
                className={`w-full flex ${
                  formData.logoAlignment === 'center'
                    ? 'justify-center'
                    : formData.logoAlignment === 'right'
                    ? 'justify-end'
                    : 'justify-start'
                } bg-white p-4 border border-dashed border-slate-300 rounded min-h-[90px] items-center`}
              >
                <img
                  src={formData.logo}
                  alt="Logo Perusahaan"
                  className="object-contain transition-all"
                  style={{
                    maxHeight: `${Math.round(48 * (formData.logoSize / 100))}px`,
                    maxWidth: `${Math.round(200 * (formData.logoSize / 100))}px`,
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1F4D] bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ganti Logo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Logo</span>
                </button>
              </div>
            </div>

            {/* Logo Size and Alignment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 border border-slate-200 rounded-md text-xs">
              {/* Slider Size */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Sliders className="w-3.5 h-3.5 text-[#0B1F4D]" />
                    <span>Ukuran Logo</span>
                  </div>
                  <span className="font-mono font-bold text-[#0B1F4D] bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                    {formData.logoSize}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={formData.logoSize}
                  onChange={(e) =>
                    setFormData({ ...formData, logoSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#0B1F4D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Kecil (50%)</span>
                  <span>Standar (100%)</span>
                  <span>Besar (150%)</span>
                </div>
              </div>

              {/* Alignment Selector */}
              <div>
                <span className="block font-semibold text-slate-700 mb-1.5">
                  Posisi Logo (Alignment)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoAlignment: align })}
                      className={`py-1.5 px-2 rounded text-center font-semibold text-xs border transition-colors capitalize ${
                        formData.logoAlignment === align
                          ? 'bg-[#0B1F4D] text-white border-[#0B1F4D]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {align === 'left' ? 'Kiri' : align === 'center' ? 'Tengah' : 'Kanan'}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Posisi logo pada kop surat STTB (default: Kiri).
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Logo State */
          <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center bg-slate-50/50">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Belum ada logo perusahaan
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-4">
              Format yang didukung: PNG, JPG, JPEG, SVG (latar belakang transparan direkomendasikan).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Logo</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. SECTION: CABANG */}
      <section className="bg-white border border-slate-200 rounded-md p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#0B1F4D]/10 text-[#0B1F4D]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wide">
                Cabang
              </h3>
              <p className="text-[11px] text-slate-500">
                Kelola daftar kantor cabang yang tersedia saat pembuatan STTB.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddBranchModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>+ Tambah Cabang</span>
          </button>
        </div>

        {branches.length === 0 ? (
          /* Empty Branch State */
          <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center bg-slate-50/50">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Belum ada cabang</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-4">
              Tambahkan kantor cabang pertama Anda agar dapat dipilih pada form STTB.
            </p>
            <button
              type="button"
              onClick={openAddBranchModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>+ Tambah Cabang</span>
            </button>
          </div>
        ) : (
          /* Branch Table */
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white">
                <tr>
                  <th className="py-2.5 px-3 w-16">Kode</th>
                  <th className="py-2.5 px-3">Nama Cabang</th>
                  <th className="py-2.5 px-3">Alamat</th>
                  <th className="py-2.5 px-3">Telepon</th>
                  <th className="py-2.5 px-3 text-center w-24">Status</th>
                  <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0B1F4D]">
                      {b.kode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{b.nama}</span>
                        {b.isDefault && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF7A00]/15 text-[#D96800] border border-[#FF7A00]/30">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Utama
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate" title={b.alamat}>
                      {b.alamat || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {b.telepon || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditBranchModal(b)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Cabang"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBranchToDelete(b)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Cabang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. BOTTOM SAVE ACTION BAR */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => handleSaveCompany()}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-[#FF7A00] hover:bg-[#E56E00] rounded shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* MODAL: TAMBAH / EDIT CABANG */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h4 className="font-extrabold text-sm text-[#0B1F4D]">
                {editingBranchId ? 'Edit Cabang' : 'Tambah Cabang Baru'}
              </h4>
              <button
                type="button"
                onClick={() => setBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {branchFormError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{branchFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBranch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Cabang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BDG"
                    value={branchForm.kode}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, kode: e.target.value.toUpperCase() })
                    }
                    className="w-full uppercase font-mono font-bold bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Harus unik</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={branchForm.status}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        status: e.target.value as 'Aktif' | 'Nonaktif',
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Cabang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Vilogistic Bandung"
                  value={branchForm.nama}
                  onChange={(e) => setBranchForm({ ...branchForm, nama: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Cabang</label>
                <textarea
                  rows={2}
                  placeholder="Alamat lengkap operasional cabang..."
                  value={branchForm.alamat}
                  onChange={(e) => setBranchForm({ ...branchForm, alamat: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  placeholder="Contoh: 022-750-8899"
                  value={branchForm.telepon}
                  onChange={(e) => setBranchForm({ ...branchForm, telepon: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
                />
              </div>

              {/* Default branch toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={branchForm.isDefault}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Jadikan Cabang Utama</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Cabang ini akan otomatis terpilih secara default pada form pembuatan STTB baru.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 mt-3">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B1F4D] hover:bg-[#102A56] text-white font-bold rounded transition-colors"
                >
                  {editingBranchId ? 'Simpan Perubahan' : 'Tambah Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS CABANG */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 text-xs">
            <div className="flex items-center gap-2.5 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-slate-900">Hapus cabang ini?</h4>
            </div>
            <p className="text-slate-600 mb-1">
              Apakah Anda yakin ingin menghapus cabang{' '}
              <strong className="text-slate-900">{branchToDelete.nama}</strong> ({branchToDelete.kode})?
            </p>
            <p className="text-[11px] text-slate-500 mb-4 italic">
              Data cabang yang dihapus tidak dapat digunakan lagi. Dokumen STTB lama yang tersimpan akan tetap mempertahankan riwayat cabangnya.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBranch}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
