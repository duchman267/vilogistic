import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { STTBForm } from './components/STTBForm';
import { STTBDocument } from './components/STTBDocument';
import { STTBPreviewMode } from './components/STTBPreviewMode';
import { STTBHistory } from './components/STTBHistory';
import { SettingsView } from './components/SettingsView';
import { ComingSoonView } from './components/ComingSoonView';
import {
  STTBFormData,
  STTBRecord,
  ValidationErrors,
} from './types/sttb';
import { CompanySettings, Branch } from './types/settings';
import {
  getSTTBRecords,
  saveSTTBRecord,
  deleteSTTBRecord,
  createEmptySTTBFormData,
} from './utils/sttbStorage';
import {
  getCompanySettings,
  saveCompanySettings,
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  getDefaultBranch,
} from './utils/settingsStorage';
import { downloadSTTBPdf, printSTTB } from './utils/pdfGenerator';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [currentBranch, setCurrentBranch] = useState('Vilogistic Bandung');
  const [savedRecords, setSavedRecords] = useState<STTBRecord[]>([]);

  // Company and Branch settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getCompanySettings());
  const [branches, setBranches] = useState<Branch[]>(() => getBranches());

  // Current Form state (Central source of truth for unsaved state)
  const [formData, setFormData] = useState<STTBFormData>(() =>
    createEmptySTTBFormData('Vilogistic Bandung')
  );
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Dedicated Preview Mode state
  const [isDedicatedPreviewOpen, setIsDedicatedPreviewOpen] = useState(false);

  // Print target data
  const [printRecord, setPrintRecord] = useState<STTBFormData | null>(null);

  // Validation & Notification
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Load saved records, company settings, and branches from localStorage on mount
  useEffect(() => {
    const loaded = getSTTBRecords();
    setSavedRecords(loaded);

    const loadedBranches = getBranches();
    setBranches(loadedBranches);
    const def = getDefaultBranch();
    if (def) {
      setCurrentBranch(def.nama);
      setFormData((prev) => ({
        ...prev,
        cabang: prev.cabang || def.nama,
      }));
    }

    const loadedCompany = getCompanySettings();
    setCompanySettings(loadedCompany);
  }, []);

  // Update branch in form when header branch changes
  const handleBranchChange = (newBranch: string) => {
    setCurrentBranch(newBranch);
    setFormData((prev) => ({
      ...prev,
      cabang: newBranch,
    }));
  };

  // Company Settings handler
  const handleSaveCompanySettings = (newSettings: CompanySettings) => {
    saveCompanySettings(newSettings);
    setCompanySettings(newSettings);
  };

  // Branch handlers
  const handleAddBranch = (branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const added = addBranch(branchData);
    const updated = getBranches();
    setBranches(updated);
    if (added.isDefault || updated.length === 1) {
      setCurrentBranch(added.nama);
      setFormData((prev) => ({ ...prev, cabang: added.nama }));
    }
  };

  const handleUpdateBranch = (id: string, branchData: Partial<Branch>) => {
    const updated = updateBranch(id, branchData);
    const updatedList = getBranches();
    setBranches(updatedList);
    if (updated.isDefault) {
      setCurrentBranch(updated.nama);
      setFormData((prev) => ({ ...prev, cabang: updated.nama }));
    } else if (currentBranch === updated.nama && updated.status === 'Nonaktif') {
      const def = getDefaultBranch();
      if (def) {
        setCurrentBranch(def.nama);
        setFormData((prev) => ({ ...prev, cabang: def.nama }));
      }
    }
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch(id);
    const updatedList = getBranches();
    setBranches(updatedList);
    const def = getDefaultBranch();
    if (def) {
      setCurrentBranch(def.nama);
      setFormData((prev) => ({ ...prev, cabang: def.nama }));
    } else {
      setCurrentBranch('');
      setFormData((prev) => ({ ...prev, cabang: '' }));
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.nomorSTTB.trim()) {
      errors.nomorSTTB = 'No. STTB wajib ada';
    }
    if (!formData.tanggal) {
      errors.tanggal = 'Tanggal wajib diisi';
    }
    if (!formData.pengirim.nama.trim()) {
      errors.pengirimNama = 'Nama pengirim wajib diisi';
    }
    if (!formData.pengirim.kontak.trim()) {
      errors.pengirimKontak = 'Kontak pengirim wajib diisi';
    }
    if (!formData.pengirim.alamat.trim()) {
      errors.pengirimAlamat = 'Alamat pengirim wajib diisi';
    }
    if (!formData.penerima.nama.trim()) {
      errors.penerimaNama = 'Nama penerima wajib diisi';
    }
    if (!formData.penerima.kontak.trim()) {
      errors.penerimaKontak = 'Kontak penerima wajib diisi';
    }
    if (!formData.penerima.alamat.trim()) {
      errors.penerimaAlamat = 'Alamat penerima wajib diisi';
    }
    if (!formData.penerima.kotaTujuan.trim()) {
      errors.kotaTujuan = 'Kota tujuan wajib diisi';
    }
    if (!formData.penerima.provinsi.trim()) {
      errors.provinsi = 'Provinsi tujuan wajib diisi';
    }

    // Check items
    if (formData.items.length === 0) {
      errors.items = 'Minimal satu barang harus dicantumkan';
    } else {
      const hasEmptyItem = formData.items.some(
        (it) => !it.keterangan.trim() || it.jumlah <= 0 || it.berat <= 0
      );
      if (hasEmptyItem) {
        errors.items = 'Lengkapi seluruh baris barang (keterangan, jumlah, dan berat)';
      }
    }

    if (formData.layanan.ongkosKirim < 0) {
      errors.ongkosKirim = 'Ongkos kirim tidak boleh negatif';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle opening dedicated Preview mode
  const handleOpenPreview = () => {
    if (!validateForm()) {
      showToast('Harap lengkapi semua bidang bertanda bintang (*)', 'error');
      return;
    }
    setPrintRecord(formData);
    setIsDedicatedPreviewOpen(true);
  };

  // Handle Print trigger from Preview mode (synchronous execution to keep native user activation gesture)
  const handlePrintFromPreview = () => {
    setPrintRecord(formData);
    printSTTB();
  };

  // Handle Download PDF
  const handleDownloadPDF = async (): Promise<boolean | void> => {
    if (!validateForm()) {
      showToast('Harap lengkapi data STTB sebelum mengunduh PDF', 'error');
      throw new Error('Validation failed');
    }

    const cleanNumber = formData.nomorSTTB.trim() || 'VLG';
    const filename = `STTB-${cleanNumber}.pdf`;

    try {
      await downloadSTTBPdf('sttb-printable-document', filename);
      showToast('PDF berhasil dibuat.');
      return true;
    } catch (err) {
      console.error('Failed to generate STTB PDF:', err);
      showToast('Gagal membuat PDF. Silakan coba lagi.', 'error');
      throw err;
    }
  };

  // Save STTB handler
  const handleSaveSTTB = (andPrint: boolean = false) => {
    if (!validateForm()) {
      showToast('Harap lengkapi semua bidang bertanda bintang (*)', 'error');
      return;
    }

    const dataToSave: STTBFormData = {
      ...formData,
      companySnapshot: companySettings,
    };

    const saved = saveSTTBRecord(dataToSave, editingRecordId || undefined);
    const updatedRecords = getSTTBRecords();
    setSavedRecords(updatedRecords);

    if (editingRecordId) {
      showToast(`STTB ${saved.nomorSTTB} berhasil diperbarui.`);
      setEditingRecordId(null);
    } else {
      showToast('STTB berhasil disimpan.');
    }

    if (andPrint) {
      flushSync(() => {
        setPrintRecord(formData);
      });
      printSTTB();
    }
  };

  // Save Draft handler
  const handleSaveDraft = () => {
    const dataToSave: STTBFormData = {
      ...formData,
      companySnapshot: companySettings,
    };
    const saved = saveSTTBRecord(dataToSave, editingRecordId || undefined);
    const updatedRecords = getSTTBRecords();
    setSavedRecords(updatedRecords);
    showToast(`Draft ${saved.nomorSTTB} berhasil disimpan.`);
  };

  // Reset handler
  const handleResetForm = () => {
    const fresh = createEmptySTTBFormData(currentBranch);
    setFormData(fresh);
    setEditingRecordId(null);
    setValidationErrors({});
    showToast('Formulir berhasil direset ke keadaan awal.', 'info');
  };

  // Edit from history
  const handleEditFromHistory = (record: STTBRecord) => {
    setFormData(record);
    setEditingRecordId(record.id);
    setCurrentBranch(record.cabang);
    setActiveTab('create');
    setValidationErrors({});
    showToast(`Memuat STTB ${record.nomorSTTB} untuk diedit.`);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    handleResetForm();
  };

  // Delete from history
  const handleDeleteFromHistory = (id: string) => {
    deleteSTTBRecord(id);
    const updated = getSTTBRecords();
    setSavedRecords(updated);
    showToast('STTB berhasil dihapus dari sistem.');
  };

  // Print direct from history (completely synchronous to preserve user activation gesture)
  const handlePrintDirect = (record: STTBRecord) => {
    flushSync(() => {
      setPrintRecord(record);
    });
    printSTTB();
  };

  // Create new from history
  const handleCreateNew = () => {
    handleResetForm();
    setActiveTab('create');
  };

  const pageTitle =
    activeTab === 'create'
      ? editingRecordId
        ? 'Edit Surat Tanda Terima Barang'
        : 'Buat Surat Tanda Terima Barang'
      : activeTab === 'history'
      ? 'Riwayat Surat Tanda Terima Barang'
      : activeTab === 'laporan-penjualan'
      ? 'Laporan Penjualan'
      : activeTab === 'laporan-keuangan'
      ? 'Laporan Keuangan'
      : 'Pengaturan';

  return (
    <>
      {/* 1. APPLICATION UI (Hidden completely during native browser printing via .app-shell) */}
      <div className="app-shell min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setValidationErrors({});
          }}
          savedCount={savedRecords.length}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Header */}
          <Header
            title={pageTitle}
            selectedBranch={currentBranch}
            onBranchChange={handleBranchChange}
            branches={branches}
          />

          {/* Notification Toast */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded shadow-lg text-xs font-semibold no-print transition-all animate-in fade-in slide-in-from-top-2">
              {toastMessage.type === 'success' && (
                <div className="bg-emerald-900 text-white flex items-center gap-2 px-4 py-2 rounded">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{toastMessage.text}</span>
                </div>
              )}
              {toastMessage.type === 'error' && (
                <div className="bg-red-900 text-white flex items-center gap-2 px-4 py-2 rounded">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{toastMessage.text}</span>
                </div>
              )}
              {toastMessage.type === 'info' && (
                <div className="bg-[#0B1F4D] text-white flex items-center gap-2 px-4 py-2 rounded">
                  <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <span>{toastMessage.text}</span>
                </div>
              )}
            </div>
          )}

          {/* Workspace Body */}
          <main className="flex-1 p-5 lg:p-6 overflow-y-auto">
            {activeTab === 'create' && (
              <div className="max-w-5xl mx-auto space-y-6">
                {/* STTB Form */}
                <STTBForm
                  formData={formData}
                  onChange={(updated) => {
                    setFormData(updated);
                    if (Object.keys(validationErrors).length > 0) {
                      setValidationErrors({});
                    }
                  }}
                  onPreview={handleOpenPreview}
                  onSave={handleSaveSTTB}
                  onSaveDraft={handleSaveDraft}
                  onReset={handleResetForm}
                  isEditing={Boolean(editingRecordId)}
                  onCancelEdit={handleCancelEdit}
                  validationErrors={validationErrors}
                  branches={branches}
                  onNavigateToSettings={() => setActiveTab('pengaturan')}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <STTBHistory
                records={savedRecords}
                companySettings={companySettings}
                onEdit={handleEditFromHistory}
                onDelete={handleDeleteFromHistory}
                onPrintDirect={handlePrintDirect}
                onCreateNew={handleCreateNew}
              />
            )}

            {activeTab === 'laporan-penjualan' && (
              <ComingSoonView
                title="Laporan Penjualan"
                onBackToCreate={() => setActiveTab('create')}
              />
            )}

            {activeTab === 'laporan-keuangan' && (
              <ComingSoonView
                title="Laporan Keuangan"
                onBackToCreate={() => setActiveTab('create')}
              />
            )}

            {activeTab === 'pengaturan' && (
              <SettingsView
                companySettings={companySettings}
                branches={branches}
                onSaveCompanySettings={handleSaveCompanySettings}
                onAddBranch={handleAddBranch}
                onUpdateBranch={handleUpdateBranch}
                onDeleteBranch={handleDeleteBranch}
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* 2. DEDICATED PREVIEW MODE (When open, displays the full STTB document and Cetak / Download PDF buttons) */}
      {isDedicatedPreviewOpen && (
        <STTBPreviewMode
          data={formData}
          companySettings={companySettings}
          onBackToEdit={() => setIsDedicatedPreviewOpen(false)}
          onPrint={handlePrintFromPreview}
          onDownloadPdf={handleDownloadPDF}
        />
      )}

      {/* 3. STANDALONE PRINT CONTAINER (Used when printing directly while preview modal is closed) */}
      {!isDedicatedPreviewOpen && (
        <div className="print-only-root">
          <STTBDocument
            id="sttb-print-only-document"
            data={printRecord || formData}
            companySettings={companySettings}
            isPreviewMode={false}
          />
        </div>
      )}
    </>
  );
}
