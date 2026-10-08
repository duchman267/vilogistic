import React from 'react';
import { STTBFormData } from '../types/sttb';
import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from '../types/settings';
import { formatDateIndonesian } from '../utils/sttbStorage';
import { Building2, User, MapPin } from 'lucide-react';

interface STTBDocumentProps {
  data: STTBFormData;
  companySettings?: CompanySettings;
  isPreviewMode?: boolean;
  id?: string;
}

export const STTBDocument: React.FC<STTBDocumentProps> = ({
  data,
  companySettings,
  isPreviewMode = false,
  id = 'sttb-printable-document',
}) => {
  // Use historical snapshot if present on saved STTB, otherwise use current companySettings
  const effectiveCompany: CompanySettings =
    data.companySnapshot || companySettings || DEFAULT_COMPANY_SETTINGS;

  // Calculations
  const totalKoli = data.items.reduce((acc, item) => acc + (Number(item.jumlah) || 0), 0);
  const totalBerat = data.items.reduce((acc, item) => acc + (Number(item.berat) || 0), 0);

  const companyName = effectiveCompany.namaPerusahaan?.trim() || 'VILOGISTIC';

  return (
    <div
      id={id}
      className={`print-sttb bg-white text-[#172033] font-sans mx-auto transition-all print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full ${
        isPreviewMode
          ? 'w-full shadow-lg border border-slate-200 rounded-sm p-6 sm:p-8 text-[12px] leading-tight select-text max-w-[820px]'
          : 'w-full p-6 sm:p-8 text-[12.5px] leading-normal max-w-[820px]'
      }`}
      style={{
        boxSizing: 'border-box',
      }}
    >
      {/* 1. DOCUMENT TOP HEADER - Dynamic from Company Settings */}
      <div className="flex items-start justify-between border-b-2 border-[#0B1F4D] pb-4 mb-4 gap-4">
        {/* Left: Dynamic Company Information with Logo */}
        <div className="flex-1 min-w-0">
          {/* Logo if configured */}
          {effectiveCompany.logo && (
            <div
              className={`mb-2 flex ${
                effectiveCompany.logoAlignment === 'center'
                  ? 'justify-center'
                  : effectiveCompany.logoAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <img
                src={effectiveCompany.logo}
                alt={companyName}
                className="object-contain"
                style={{
                  maxHeight: `${Math.round(48 * (effectiveCompany.logoSize / 100))}px`,
                  maxWidth: `${Math.round(200 * (effectiveCompany.logoSize / 100))}px`,
                }}
              />
            </div>
          )}

          {/* Company Name */}
          <h1 className="text-xl font-black tracking-tight text-[#0B1F4D] leading-none mb-1">
            {companyName}
          </h1>

          {/* Company Contact Details (Only show filled fields) */}
          <div className="text-[10px] text-slate-600 leading-snug space-y-0.5 mt-1">
            {effectiveCompany.alamat && (
              <p className="text-slate-700">{effectiveCompany.alamat}</p>
            )}

            {(effectiveCompany.telepon || effectiveCompany.email || effectiveCompany.website) && (
              <p className="text-slate-500">
                {[
                  effectiveCompany.telepon && `Telp: ${effectiveCompany.telepon}`,
                  effectiveCompany.email && `Email: ${effectiveCompany.email}`,
                  effectiveCompany.website && `Web: ${effectiveCompany.website}`,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            )}

            {data.cabang && (
              <p className="text-slate-500 font-medium">
                Hub / Cabang: {data.cabang}
              </p>
            )}
          </div>
        </div>

        {/* Right: Document Title & STTB Number */}
        <div className="text-right shrink-0">
          <h2 className="text-lg font-black tracking-wider text-[#0B1F4D] uppercase leading-none">
            SURAT TANDA TERIMA BARANG
          </h2>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase block mt-0.5">
            GOODS RECEIPT
          </span>
          <div className="mt-2 inline-block bg-[#0B1F4D]/5 border border-[#0B1F4D]/20 px-3 py-1 rounded">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">No. STTB</span>
            <span className="text-sm font-mono font-extrabold text-[#0B1F4D] tracking-wide">
              {data.nomorSTTB || 'VLG-YYYYMMDD-XXXX'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. META INFORMATION BAR */}
      <div className="grid grid-cols-4 gap-2 bg-[#F5F7FA] border border-slate-200 rounded px-3 py-2 mb-4 text-[11px]">
        <div>
          <span className="text-slate-500 block text-[10px]">Tanggal Penerimaan</span>
          <span className="font-semibold text-slate-800">
            {formatDateIndonesian(data.tanggal)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Waktu</span>
          <span className="font-semibold text-slate-800">{data.jam || '-'} WIB</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Kantor Cabang</span>
          <span className="font-semibold text-slate-800">{data.cabang || '-'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Petugas Penerima</span>
          <span className="font-semibold text-slate-800">{data.petugas || 'Operator'}</span>
        </div>
      </div>

      {/* 3. PENGIRIM & PENERIMA CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* PENGIRIM */}
        <div className="border border-slate-300 rounded p-3 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-[#0B1F4D] font-bold text-[12px] uppercase tracking-wide">
              <User className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Pengirim</span>
            </div>
            {data.pengirim.perusahaan && (
              <span className="text-[10px] text-slate-500 truncate max-w-[140px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {data.pengirim.perusahaan}
              </span>
            )}
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 text-[10px]">Nama</span>
              <span className="font-bold text-slate-900">: {data.pengirim.nama || '-'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 text-[10px]">Kontak / HP</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                : {data.pengirim.kontak || '-'}
              </span>
            </div>
            {data.pengirim.perusahaan && (
              <div className="flex items-baseline">
                <span className="w-18 text-slate-500 text-[10px]">Perusahaan</span>
                <span className="font-medium text-slate-800">: {data.pengirim.perusahaan}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="w-18 text-slate-500 text-[10px] shrink-0">Alamat</span>
              <span className="text-slate-700 leading-snug break-words">
                : {data.pengirim.alamat || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* PENERIMA */}
        <div className="border border-slate-300 rounded p-3 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-[#0B1F4D] font-bold text-[12px] uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Penerima</span>
            </div>
            {data.penerima.perusahaan && (
              <span className="text-[10px] text-slate-500 truncate max-w-[140px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {data.penerima.perusahaan}
              </span>
            )}
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-baseline">
              <span className="w-20 text-slate-500 text-[10px]">Nama</span>
              <span className="font-bold text-slate-900">: {data.penerima.nama || '-'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-20 text-slate-500 text-[10px]">Kontak / HP</span>
              <span className="font-medium text-slate-800">: {data.penerima.kontak || '-'}</span>
            </div>
            {data.penerima.perusahaan && (
              <div className="flex items-baseline">
                <span className="w-20 text-slate-500 text-[10px]">Perusahaan</span>
                <span className="font-medium text-slate-800">: {data.penerima.perusahaan}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="w-20 text-slate-500 text-[10px] shrink-0">Alamat</span>
              <span className="text-slate-700 leading-snug break-words">
                : {data.penerima.alamat || '-'}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-20 text-slate-500 text-[10px]">Tujuan</span>
              <span className="font-bold text-[#0B1F4D]">
                : {data.penerima.kotaTujuan || '-'}, {data.penerima.provinsi || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAIL BARANG TABLE */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-wide">
            Detail Barang Kiriman
          </span>
          <span className="text-[10px] text-slate-500">
            Total {data.items.length} Baris Barang
          </span>
        </div>
        <table className="w-full border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-[#0B1F4D] text-white">
              <th className="border border-slate-400 py-1.5 px-2 text-center w-10">No.</th>
              <th className="border border-slate-400 py-1.5 px-3 text-left">Jenis / Keterangan Barang</th>
              <th className="border border-slate-400 py-1.5 px-3 text-center w-20">Jumlah</th>
              <th className="border border-slate-400 py-1.5 px-3 text-center w-20">Satuan</th>
              <th className="border border-slate-400 py-1.5 px-3 text-right w-24">Berat (Kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                  Belum ada rincian barang.
                </td>
              </tr>
            ) : (
              data.items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}
                >
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 font-medium text-slate-900">
                    {item.keterangan || '-'}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-center font-bold">
                    {item.jumlah || 0}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-center text-slate-700">
                    {item.satuan}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-right font-medium">
                    {Number(item.berat || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#F5F7FA] font-bold text-slate-900 border-t-2 border-slate-400">
              <td colSpan={2} className="border border-slate-300 py-2 px-3 text-right uppercase text-[10px]">
                Total Akumulasi:
              </td>
              <td className="border border-slate-300 py-2 px-3 text-center text-[#0B1F4D]">
                {totalKoli}
              </td>
              <td className="border border-slate-300 py-2 px-3 text-center text-[10px] text-slate-600">
                Koli / Paket
              </td>
              <td className="border border-slate-300 py-2 px-3 text-right text-[#0B1F4D]">
                {totalBerat.toLocaleString('id-ID')} Kg
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. CATATAN */}
      <div className="border border-slate-300 rounded p-3 bg-white mb-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
          <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-wide">
            Catatan
          </span>
          <span className="text-[10px] text-slate-400">Instruksi Khusus / Keterangan Tambahan</span>
        </div>
        <div className="bg-[#F5F7FA] border border-slate-200 rounded p-2 min-h-[38px] text-[11px] text-slate-700 leading-snug break-words">
          {data.catatan ? (
            data.catatan
          ) : (
            <span className="text-slate-400 italic">- Tidak ada catatan tambahan -</span>
          )}
        </div>
      </div>

      {/* 6. DECLARATION STATEMENTS */}
      <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 mb-4 text-[10px] text-slate-600 leading-relaxed">
        <p className="mb-0.5 font-medium">
          1. Barang tersebut telah diterima oleh {companyName} dalam kondisi sebagaimana diserahkan oleh pengirim.
        </p>
        <p className="font-medium">
          2. Dokumen ini merupakan bukti tanda terima barang yang sah dan wajib disimpan untuk keperluan verifikasi pengiriman.
        </p>
      </div>

      {/* 7. SIGNATURE BLOCKS */}
      <div className="grid grid-cols-2 gap-8 mb-4">
        {/* PENGIRIM / PENYERAH */}
        <div className="border border-slate-300 rounded p-3 text-center">
          <p className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-wide mb-1">
            PENGIRIM / PENYERAH
          </p>
          <p className="text-[9px] text-slate-500 mb-12">Tanda tangan & Nama Jelas</p>
          <div className="border-t border-slate-400 pt-1.5 text-left text-[10px] space-y-1">
            <div className="flex">
              <span className="w-20 text-slate-500">Nama</span>
              <span className="font-medium">: {data.pengirim.nama || '________________________'}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-500">Tanggal</span>
              <span className="font-medium">: {formatDateIndonesian(data.tanggal)}</span>
            </div>
          </div>
        </div>

        {/* PETUGAS */}
        <div className="border border-slate-300 rounded p-3 text-center">
          <p className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-wide mb-1">
            PETUGAS {companyName.toUpperCase()}
          </p>
          <p className="text-[9px] text-slate-500 mb-12">Cap Cabang & Tanda Tangan</p>
          <div className="border-t border-slate-400 pt-1.5 text-left text-[10px] space-y-1">
            <div className="flex">
              <span className="w-20 text-slate-500">Nama Petugas</span>
              <span className="font-medium">: {data.petugas || 'Operator'}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-500">Cabang</span>
              <span className="font-medium">: {data.cabang || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. FOOTER */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0B1F4D]">{companyName}</span>
          <span>•</span>
          <span className="italic">"Reliable Logistics. Connected Everywhere."</span>
        </div>
        <div className="text-right">
          <span>Dicetak otomatis melalui Sistem STTB {companyName}</span>
        </div>
      </div>
    </div>
  );
};
