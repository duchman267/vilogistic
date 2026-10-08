import React from 'react';
import {
  FilePlus,
  History,
  TrendingUp,
  Receipt,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab = 'create' | 'history' | 'laporan-penjualan' | 'laporan-keuangan' | 'pengaturan';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
}) => {
  return (
    <aside className="w-56 shrink-0 bg-[#0B1F4D] text-slate-200 flex flex-col justify-between min-h-screen border-r border-[#102A56] no-print">
      {/* Top brand section - Clean typography without logo */}
      <div>
        <div className="p-4 border-b border-[#1A3366] text-center bg-[#071638]">
          <h2 className="text-xl font-black tracking-wider text-white">
            VILOGISTIC
          </h2>
          <span className="text-[10px] font-semibold text-[#FF7A00] tracking-wider uppercase block mt-1">
            STTB Generator System
          </span>
        </div>

        {/* Navigation Menus */}
        <nav className="p-3 space-y-5 text-xs">
          {/* MENU Section */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Utama
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectTab('create')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-all text-left ${
                  activeTab === 'create'
                    ? 'bg-[#FF7A00] text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-[#102A56] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FilePlus className="w-4 h-4 shrink-0" />
                  <span>Buat STTB</span>
                </div>
                {activeTab === 'create' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('history')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-all text-left ${
                  activeTab === 'history'
                    ? 'bg-[#FF7A00] text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-[#102A56] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 shrink-0" />
                  <span>Riwayat STTB</span>
                </div>
                {savedCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'history'
                        ? 'bg-white text-[#FF7A00]'
                        : 'bg-[#1A3366] text-slate-200'
                    }`}
                  >
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* REPORTS Section */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Reports
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectTab('laporan-penjualan')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded transition-all text-left ${
                  activeTab === 'laporan-penjualan'
                    ? 'bg-[#102A56] text-white font-bold'
                    : 'text-slate-400 hover:bg-[#102A56]/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Laporan Penjualan</span>
                </div>
                <span className="text-[9px] bg-[#1A3366] text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  SOON
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('laporan-keuangan')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded transition-all text-left ${
                  activeTab === 'laporan-keuangan'
                    ? 'bg-[#102A56] text-white font-bold'
                    : 'text-slate-400 hover:bg-[#102A56]/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Laporan Keuangan</span>
                </div>
                <span className="text-[9px] bg-[#1A3366] text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  SOON
                </span>
              </button>
            </div>
          </div>

          {/* SETTINGS Section */}
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Settings
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectTab('pengaturan')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-all text-left ${
                  activeTab === 'pengaturan'
                    ? 'bg-[#FF7A00] text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-[#102A56] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Pengaturan</span>
                </div>
                {activeTab === 'pengaturan' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Brand Card */}
      <div className="p-3 border-t border-[#1A3366] bg-[#071638] text-[11px]">
        <div className="flex items-center gap-2 text-white font-bold mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>VILOGISTIC</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          "Reliable Logistics.
          <br />
          Connected Everywhere."
        </p>
      </div>
    </aside>
  );
};
