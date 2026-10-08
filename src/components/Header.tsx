import React from 'react';
import { Bell, MapPin } from 'lucide-react';
import { Branch } from '../types/settings';

interface HeaderProps {
  title: string;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  operatorName?: string;
  branches?: Branch[];
}

export const Header: React.FC<HeaderProps> = ({
  title,
  selectedBranch,
  onBranchChange,
  operatorName = 'Operator',
  branches = [],
}) => {
  const activeBranches = branches.filter((b) => b.status === 'Aktif');

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-extrabold text-[#0B1F4D] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 text-xs">
        {/* Branch Selector connected to settings */}
        <div className="flex items-center gap-1.5 bg-[#F5F7FA] border border-slate-200 rounded-md px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium">Cabang:</span>
            {activeBranches.length > 0 ? (
              <select
                value={selectedBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                className="bg-transparent font-bold text-[#0B1F4D] focus:outline-hidden cursor-pointer"
              >
                {!activeBranches.some((b) => b.nama === selectedBranch) && (
                  <option value="">-- Pilih Cabang --</option>
                )}
                {activeBranches.map((b) => (
                  <option key={b.id} value={b.nama}>
                    {b.kode ? `${b.kode} - ${b.nama}` : b.nama}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-semibold text-slate-500 text-[11px]">
                {selectedBranch || 'Belum ada cabang'}
              </span>
            )}
          </div>
        </div>

        {/* Notification Icon */}
        <div className="relative p-1.5 text-slate-500 hover:text-[#0B1F4D] hover:bg-slate-100 rounded cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#FF7A00] absolute top-1 right-1"></span>
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
            RH
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0B1F4D] text-[11px] leading-tight">
              {operatorName}
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
