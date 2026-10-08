import React, { useState } from 'react';
import { STTBFormData } from '../types/sttb';
import { CompanySettings } from '../types/settings';
import { STTBDocument } from './STTBDocument';
import { ArrowLeft, Printer, Download, Eye, Loader2, CheckCircle } from 'lucide-react';

interface STTBPreviewModeProps {
  data: STTBFormData;
  companySettings?: CompanySettings;
  onBackToEdit: () => void;
  onPrint: () => void;
  onDownloadPdf: () => Promise<boolean | void>;
}

export const STTBPreviewMode: React.FC<STTBPreviewModeProps> = ({
  data,
  companySettings,
  onBackToEdit,
  onPrint,
  onDownloadPdf,
}) => {
  const [pdfLoadingState, setPdfLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Direct, reliable print handler that triggers native browser print dialog
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadClick = async () => {
    if (pdfLoadingState === 'loading') return;

    setPdfLoadingState('loading');
    try {
      await onDownloadPdf();
      setPdfLoadingState('success');
      setTimeout(() => {
        setPdfLoadingState('idle');
      }, 2500);
    } catch (err) {
      console.error('Error during PDF download in preview mode:', err);
      setPdfLoadingState('error');
      setTimeout(() => {
        setPdfLoadingState('idle');
      }, 3000);
    }
  };

  return (
    <div className="preview-modal-root fixed inset-0 z-50 bg-[#0F172A] overflow-y-auto flex flex-col">
      {/* PREVIEW TOP ACTION BAR (Hidden when printed) */}
      <div className="no-print sticky top-0 z-10 bg-[#0B1F4D] text-white border-b border-[#1A3366] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Kembali Edit Button */}
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded transition-colors border border-white/20 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF7A00]" />
          <span>← Kembali Edit</span>
        </button>

        {/* Center: Document Indicator */}
        <div className="flex items-center gap-2 text-center">
          <Eye className="w-4 h-4 text-[#FF7A00] hidden sm:inline-block" />
          <span className="text-xs font-extrabold tracking-wide text-white uppercase">
            Pratinjau Surat Tanda Terima Barang
          </span>
          <span className="font-mono text-xs bg-[#FF7A00] text-white px-2 py-0.5 rounded font-bold">
            {data.nomorSTTB || 'VLG-YYYYMMDD-XXXX'}
          </span>
        </div>

        {/* Right: Cetak and Download PDF Buttons */}
        <div className="flex items-center gap-2.5">
          {/* CETAK BUTTON */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0B1F4D] bg-white hover:bg-slate-100 rounded transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="Cetak Surat Tanda Terima Barang"
          >
            <Printer className="w-4 h-4 text-[#0B1F4D]" />
            <span>Cetak</span>
          </button>

          {/* DOWNLOAD PDF BUTTON */}
          <button
            type="button"
            disabled={pdfLoadingState === 'loading'}
            onClick={handleDownloadClick}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded transition-colors shadow-xs active:scale-95 cursor-pointer ${
              pdfLoadingState === 'success'
                ? 'bg-emerald-600 text-white'
                : pdfLoadingState === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-[#FF7A00] hover:bg-[#E56E00] text-white disabled:opacity-60'
            }`}
            title="Download STTB sebagai PDF"
          >
            {pdfLoadingState === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : pdfLoadingState === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>PDF berhasil dibuat!</span>
              </>
            ) : pdfLoadingState === 'error' ? (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Gagal membuat PDF</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="preview-doc-wrapper flex-1 py-8 px-4 flex justify-center items-start bg-slate-900/60 print:bg-white print:p-0">
        <div className="w-full max-w-[840px] shadow-2xl print:shadow-none print:max-w-none">
          <STTBDocument
            id="sttb-printable-document"
            data={data}
            companySettings={companySettings}
            isPreviewMode={true}
          />
        </div>
      </div>
    </div>
  );
};
