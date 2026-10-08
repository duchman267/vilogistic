import React, { useState, useMemo } from 'react';
import { STTBRecord } from '../types/sttb';
import { CompanySettings } from '../types/settings';
import { formatRupiah, formatDateIndonesian } from '../utils/sttbStorage';
import {
  Search,
  Calendar,
  Eye,
  Printer,
  Download,
  Loader2,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  X,
  Package,
} from 'lucide-react';
import { STTBDocument } from './STTBDocument';
import { downloadSTTBPdf } from '../utils/pdfGenerator';

interface STTBHistoryProps {
  records: STTBRecord[];
  companySettings?: CompanySettings;
  onEdit: (record: STTBRecord) => void;
  onDelete: (id: string) => void;
  onPrintDirect: (record: STTBRecord) => void;
  onCreateNew: () => void;
}

export const STTBHistory: React.FC<STTBHistoryProps> = ({
  records,
  companySettings,
  onEdit,
  onDelete,
  onPrintDirect,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [viewRecord, setViewRecord] = useState<STTBRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<STTBRecord | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPDF = async (record: STTBRecord) => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const cleanNumber = record.nomorSTTB.trim() || 'VLG';
      const filename = `STTB-${cleanNumber}.pdf`;
      await downloadSTTBPdf('sttb-detail-modal-document', filename);
    } catch (err) {
      console.error('Failed to download STTB PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        rec.nomorSTTB.toLowerCase().includes(q) ||
        rec.pengirim.nama.toLowerCase().includes(q) ||
        rec.penerima.nama.toLowerCase().includes(q) ||
        rec.penerima.kotaTujuan.toLowerCase().includes(q) ||
        rec.cabang.toLowerCase().includes(q);

      const matchDate = !filterDate || rec.tanggal === filterDate;

      return matchQuery && matchDate;
    });
  }, [records, searchQuery, filterDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LUNAS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'SEBAGIAN':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'BELUM BAYAR':
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#0B1F4D] tracking-tight">
              Riwayat Surat Tanda Terima Barang
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh STTB yang telah disimpan di sistem.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E56E00] rounded transition-colors shadow-2xs"
          >
            <span>+ Buat STTB Baru</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari No. STTB, Pengirim, Penerima, Kota Tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-7 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0B1F4D]"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                title="Hapus filter tanggal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table or Empty State */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {records.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#0B1F4D] mb-1">Belum ada STTB</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Belum ada surat tanda terima barang yang tersimpan. Klik tombol di bawah untuk membuat STTB pertama Anda.
            </p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors"
            >
              <span>Buat STTB Sekarang</span>
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Tidak ada hasil yang cocok</p>
            <p>Silakan sesuaikan kata kunci pencarian atau tanggal filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1F4D] text-white select-none">
                <tr>
                  <th className="py-2.5 px-3">No. STTB</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Pengirim</th>
                  <th className="py-2.5 px-3">Penerima</th>
                  <th className="py-2.5 px-3">Kota Tujuan</th>
                  <th className="py-2.5 px-2 text-center">Koli</th>
                  <th className="py-2.5 px-2 text-right">Berat (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Total Biaya</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0B1F4D]">
                      {rec.nomorSTTB}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDateIndonesian(rec.tanggal)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[130px] truncate" title={rec.pengirim.nama}>
                      {rec.pengirim.nama || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[130px] truncate" title={rec.penerima.nama}>
                      {rec.penerima.nama || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {rec.penerima.kotaTujuan || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#0B1F4D]">
                      {rec.totalKoli}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                      {rec.totalBerat.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0B1F4D] whitespace-nowrap">
                      {formatRupiah(rec.layanan.totalBiaya)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded border uppercase ${getStatusBadge(
                          rec.pembayaran.statusPembayaran
                        )}`}
                      >
                        {rec.pembayaran.statusPembayaran}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewRecord(rec)}
                          className="p-1 text-slate-600 hover:text-[#0B1F4D] hover:bg-slate-100 rounded transition-colors"
                          title="Lihat Detail STTB"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintDirect(rec)}
                          className="p-1 text-slate-600 hover:text-[#FF7A00] hover:bg-orange-50 rounded transition-colors cursor-pointer"
                          title="Cetak STTB"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(rec)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit STTB"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(rec)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus STTB"
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
      </div>

      {/* VIEW MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B1F4D]" />
                <h3 className="font-bold text-sm text-[#0B1F4D]">
                  Detail STTB: {viewRecord.nomorSTTB}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPrintDirect(viewRecord)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E56E00] rounded transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(viewRecord)}
                  disabled={isDownloadingPdf}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#1A3366] rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingPdf ? 'Mengunduh...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <div className="max-w-2xl mx-auto shadow-md">
                <STTBDocument
                  id="sttb-detail-modal-document"
                  data={viewRecord}
                  companySettings={companySettings}
                  isPreviewMode={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {recordToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 text-xs">
            <div className="flex items-center gap-2.5 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-slate-900">Konfirmasi Hapus STTB</h4>
            </div>
            <p className="text-slate-600 mb-3">
              Apakah Anda yakin ingin menghapus STTB{' '}
              <strong className="text-slate-900 font-mono">{recordToDelete.nomorSTTB}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(recordToDelete.id);
                  setRecordToDelete(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Hapus STTB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
