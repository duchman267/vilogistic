import { CompanySettings, Branch } from './settings';

export type SatuanBarang = 'Koli' | 'Box' | 'Pcs' | 'Unit' | 'Karung' | 'Lainnya';
export type JenisLayanan = 'REGULER' | 'EXPRESS' | 'CARGO' | 'LAINNYA';
export type MetodePembayaran = 'CASH' | 'TRANSFER' | 'QRIS' | 'CREDIT';
export type StatusPembayaran = 'LUNAS' | 'SEBAGIAN' | 'BELUM BAYAR';

export interface STTBItem {
  id: string;
  keterangan: string;
  jumlah: number;
  satuan: SatuanBarang;
  berat: number; // in Kg
}

export interface PengirimData {
  nama: string;
  kontak: string;
  perusahaan: string;
  alamat: string;
}

export interface PenerimaData {
  nama: string;
  kontak: string;
  perusahaan: string;
  alamat: string;
  kotaTujuan: string;
  provinsi: string;
}

export interface LayananBiayaData {
  jenisLayanan: JenisLayanan;
  ongkosKirim: number;
  packing: number;
  asuransi: number;
  handling: number;
  biayaLain: number;
  diskon: number;
  totalBiaya: number;
}

export interface PembayaranData {
  metodePembayaran: MetodePembayaran;
  statusPembayaran: StatusPembayaran;
  jumlahDibayar: number;
  sisaPembayaran: number;
}

export interface STTBFormData {
  nomorSTTB: string;
  tanggal: string;
  jam: string;
  cabang: string;
  petugas: string;
  pengirim: PengirimData;
  penerima: PenerimaData;
  items: STTBItem[];
  layanan: LayananBiayaData;
  pembayaran: PembayaranData;
  catatan: string;
  companySnapshot?: CompanySettings;
  branchSnapshot?: Partial<Branch>;
}

export interface STTBRecord extends STTBFormData {
  id: string;
  totalKoli: number;
  totalBerat: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationErrors {
  [key: string]: string;
}
