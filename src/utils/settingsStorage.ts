import { CompanySettings, Branch, DEFAULT_COMPANY_SETTINGS } from '../types/settings';

const COMPANY_STORAGE_KEY = 'vilogistic_company_settings';
const BRANCHES_STORAGE_KEY = 'vilogistic_branches';

/**
 * Get centralized company settings from localStorage
 */
export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMPANY_SETTINGS,
      ...parsed,
      logoSize: typeof parsed.logoSize === 'number' ? parsed.logoSize : 100,
      logoAlignment: parsed.logoAlignment || 'left',
    };
  } catch (err) {
    console.error('Failed to load company settings from localStorage', err);
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}

/**
 * Save centralized company settings to localStorage
 */
export function saveCompanySettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save company settings to localStorage', err);
    throw err;
  }
}

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'br_default_bdg',
    kode: 'BDG',
    nama: 'Vilogistic Bandung',
    alamat: 'Jl. Soekarno Hatta No. 450, Bandung, Jawa Barat',
    telepon: '022-750-8899',
    status: 'Aktif',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'br_default_jkt',
    kode: 'JKT',
    nama: 'Vilogistic Jakarta',
    alamat: 'Jl. Daan Mogot KM 12, Jakarta Barat, DKI Jakarta',
    telepon: '021-540-1234',
    status: 'Aktif',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get all branches from localStorage
 */
export function getBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(BRANCHES_STORAGE_KEY);
    if (!raw) {
      saveBranches(DEFAULT_BRANCHES);
      return DEFAULT_BRANCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load branches from localStorage', err);
    return [];
  }
}

/**
 * Save all branches to localStorage
 */
export function saveBranches(branches: Branch[]): void {
  try {
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
  } catch (err) {
    console.error('Failed to save branches to localStorage', err);
    throw err;
  }
}

/**
 * Add a new branch with duplicate code check
 */
export function addBranch(
  branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>
): Branch {
  const branches = getBranches();
  const cleanCode = branchData.kode.trim().toUpperCase();

  // Validate duplicate code
  const isDuplicate = branches.some(
    (b) => b.kode.trim().toUpperCase() === cleanCode
  );
  if (isDuplicate) {
    throw new Error(`Kode cabang "${cleanCode}" sudah digunakan. Gunakan kode yang unik.`);
  }

  const now = new Date().toISOString();
  let updatedBranches = [...branches];

  // If this new branch is marked default, unset default on others
  if (branchData.isDefault) {
    updatedBranches = updatedBranches.map((b) => ({ ...b, isDefault: false }));
  } else if (updatedBranches.length === 0) {
    // If it's the very first branch, make it default automatically
    branchData.isDefault = true;
  }

  const newBranch: Branch = {
    ...branchData,
    id: 'br_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    kode: cleanCode,
    nama: branchData.nama.trim(),
    alamat: branchData.alamat?.trim() || '',
    telepon: branchData.telepon?.trim() || '',
    status: branchData.status || 'Aktif',
    isDefault: Boolean(branchData.isDefault),
    createdAt: now,
    updatedAt: now,
  };

  updatedBranches.push(newBranch);
  saveBranches(updatedBranches);
  return newBranch;
}

/**
 * Update an existing branch
 */
export function updateBranch(
  id: string,
  updatedData: Partial<Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>>
): Branch {
  const branches = getBranches();
  const index = branches.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('Cabang tidak ditemukan.');
  }

  const current = branches[index];
  const now = new Date().toISOString();

  // Check code uniqueness if code is updated
  if (updatedData.kode) {
    const cleanCode = updatedData.kode.trim().toUpperCase();
    const isDuplicate = branches.some(
      (b) => b.id !== id && b.kode.trim().toUpperCase() === cleanCode
    );
    if (isDuplicate) {
      throw new Error(`Kode cabang "${cleanCode}" sudah digunakan.`);
    }
  }

  let updatedList = [...branches];

  // If isDefault changed to true, unset default on all other branches
  if (updatedData.isDefault) {
    updatedList = updatedList.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }));
  }

  const mergedBranch: Branch = {
    ...current,
    ...updatedData,
    id,
    kode: updatedData.kode ? updatedData.kode.trim().toUpperCase() : current.kode,
    nama: updatedData.nama !== undefined ? updatedData.nama.trim() : current.nama,
    updatedAt: now,
  };

  const currentIdx = updatedList.findIndex((b) => b.id === id);
  updatedList[currentIdx] = mergedBranch;

  saveBranches(updatedList);
  return mergedBranch;
}

/**
 * Delete a branch by ID
 */
export function deleteBranch(id: string): void {
  const branches = getBranches();
  const deleted = branches.find((b) => b.id === id);
  const remaining = branches.filter((b) => b.id !== id);

  // If the deleted branch was default and there are remaining branches, make the first one default
  if (deleted?.isDefault && remaining.length > 0) {
    remaining[0].isDefault = true;
  }

  saveBranches(remaining);
}

/**
 * Get the current default branch
 */
export function getDefaultBranch(): Branch | undefined {
  const branches = getBranches();
  return branches.find((b) => b.isDefault && b.status === 'Aktif') || branches.find((b) => b.isDefault) || branches[0];
}

/**
 * Get only active branches for STTB selection
 */
export function getActiveBranches(): Branch[] {
  const branches = getBranches();
  return branches.filter((b) => b.status === 'Aktif');
}
