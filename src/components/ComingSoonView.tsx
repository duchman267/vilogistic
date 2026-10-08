import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';

interface ComingSoonViewProps {
  title: string;
  onBackToCreate: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title, onBackToCreate }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
        <Clock className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-extrabold text-[#0B1F4D] mb-1">{title}</h2>
      <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs uppercase tracking-wider mb-4 border border-amber-300">
        COMING SOON
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Modul ini sedang dalam tahap pengembangan dan akan segera tersedia pada pembaruan sistem berikutnya.
      </p>
      <button
        onClick={onBackToCreate}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#102A56] rounded transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Buat STTB</span>
      </button>
    </div>
  );
};
