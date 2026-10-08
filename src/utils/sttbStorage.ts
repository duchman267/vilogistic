import { STTBFormData, STTBRecord, STTBItem } from '../types/sttb';
import { getCompanySettings, getBranches } from './settingsStorage';

const STORAGE_KEY = 'vilogistic_sttb_records';
const LOGO_STORAGE_KEY = 'vilogistic_custom_logo';

export function getSavedLogo(): string | null {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCustomLogo(dataUrl: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
  } catch (err) {
    console.error('Failed to save logo to localStorage', err);
  }
}

export function removeCustomLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to remove custom logo', err);
  }
}

export function getSTTBRecords(): STTBRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load STTB records from localStorage', e);
    return [];
  }
}

export function saveSTTBRecord(formData: STTBFormData, existingId?: string): STTBRecord {
  const records = getSTTBRecords();
  const now = new Date().toISOString();

  // Calculate totals
  const totalKoli = formData.items.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
  const totalBerat = formData.items.reduce((sum, item) => sum + (Number(item.berat) || 0), 0);

  // Ensure company and branch snapshots for document integrity
  const companySnapshot = formData.companySnapshot || getCompanySettings();
  const branchSnapshot =
    formData.branchSnapshot ||
    getBranches().find((b) => b.nama === formData.cabang) ||
    undefined;

  if (existingId) {
    const index = records.findIndex((r) => r.id === existingId);
    if (index !== -1) {
      const updatedRecord: STTBRecord = {
        ...formData,
        companySnapshot: formData.companySnapshot || records[index].companySnapshot || companySnapshot,
        branchSnapshot: formData.branchSnapshot || records[index].branchSnapshot || branchSnapshot,
        id: existingId,
        totalKoli,
        totalBerat,
        createdAt: records[index].createdAt,
        updatedAt: now,
      };
      records[index] = updatedRecord;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return updatedRecord;
    }
  }

  // Create new record
  const newId = 'sttb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newRecord: STTBRecord = {
    ...formData,
    companySnapshot,
    branchSnapshot,
    id: newId,
    totalKoli,
    totalBerat,
    createdAt: now,
    updatedAt: now,
  };

  records.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export function deleteSTTBRecord(id: string): void {
  const records = getSTTBRecords();
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getSTTBRecordById(id: string): STTBRecord | undefined {
  const records = getSTTBRecords();
  return records.find((r) => r.id === id);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function generateNextSTTBNumber(dateStr?: string): string {
  const effectiveDate = dateStr || getTodayDateString();
  const yyyymmdd = effectiveDate.replace(/-/g, '');
  const prefix = `VLG-${yyyymmdd}-`;

  const records = getSTTBRecords();
  let maxSeq = 0;

  records.forEach((rec) => {
    if (rec.nomorSTTB && rec.nomorSTTB.startsWith(prefix)) {
      const seqStr = rec.nomorSTTB.substring(prefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

export function createInitialSTTBItem(): STTBItem {
  return {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    keterangan: '',
    jumlah: 1,
    satuan: 'Koli',
    berat: 1,
  };
}

export function createEmptySTTBFormData(branch: string = 'Vilogistic Bandung'): STTBFormData {
  const today = getTodayDateString();
  const time = getCurrentTimeString();
  const nextNumber = generateNextSTTBNumber(today);

  return {
    nomorSTTB: nextNumber,
    tanggal: today,
    jam: time,
    cabang: branch,
    petugas: 'Operator',
    pengirim: {
      nama: '',
      kontak: '',
      perusahaan: '',
      alamat: '',
    },
    penerima: {
      nama: '',
      kontak: '',
      perusahaan: '',
      alamat: '',
      kotaTujuan: '',
      provinsi: '',
    },
    items: [createInitialSTTBItem()],
    layanan: {
      jenisLayanan: 'REGULER',
      ongkosKirim: 0,
      packing: 0,
      asuransi: 0,
      handling: 0,
      biayaLain: 0,
      diskon: 0,
      totalBiaya: 0,
    },
    pembayaran: {
      metodePembayaran: 'CASH',
      statusPembayaran: 'LUNAS',
      jumlahDibayar: 0,
      sisaPembayaran: 0,
    },
    catatan: '',
  };
}

export function formatRupiah(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  const safeNum = Math.max(0, Math.round(num));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeNum);
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const mIndex = parseInt(month, 10) - 1;
  const mName = months[mIndex] || month;
  return `${parseInt(day, 10)} ${mName} ${year}`;
}
