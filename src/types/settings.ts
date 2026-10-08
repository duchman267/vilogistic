export interface CompanySettings {
  namaPerusahaan: string;
  telepon: string;
  email: string;
  website: string;
  alamat: string;
  logo: string | null; // Persistent Data URL (PNG, JPG, SVG)
  logoSize: number; // Percentage: 50% - 150%, default 100%
  logoAlignment: 'left' | 'center' | 'right'; // default 'left'
}

export interface Branch {
  id: string;
  kode: string; // Unique branch code, e.g. 'BDG'
  nama: string; // Branch name, e.g. 'Vilogistic Bandung'
  alamat: string;
  telepon: string;
  status: 'Aktif' | 'Nonaktif';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  namaPerusahaan: 'Vilogistic',
  telepon: '',
  email: '',
  website: '',
  alamat: '',
  logo: null,
  logoSize: 100,
  logoAlignment: 'left',
};
