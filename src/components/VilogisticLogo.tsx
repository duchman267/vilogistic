import React, { useState, useEffect } from 'react';
import { getSavedLogo, saveCustomLogo, removeCustomLogo } from '../utils/sttbStorage';

interface VilogisticLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadOption?: boolean;
}

export const VilogisticLogo: React.FC<VilogisticLogoProps> = ({
  className = '',
  size = 'md',
  showUploadOption = false,
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCustomLogo(getSavedLogo());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        saveCustomLogo(result);
        setCustomLogo(result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    removeCustomLogo();
    setCustomLogo(null);
    setImageError(false);
  };

  const heights = {
    sm: 'h-9',
    md: 'h-13',
    lg: 'h-18',
    xl: 'h-24',
  };

  return (
    <div className={`inline-flex items-center relative group ${className}`}>
      {customLogo && !imageError ? (
        <img
          src={customLogo}
          alt="Vilogistic"
          className={`${heights[size]} object-contain`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${heights[size]} flex items-center justify-center aspect-[420/280]`}>
          <svg
            viewBox="0 0 420 280"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top Emblem V */}
            <g transform="translate(10, 5)">
              {/* Orange upper triangle facet */}
              <polygon points="175,10 305,10 215,108" fill="#FF7A00" />
              {/* Deep Navy main V-fold ribbon */}
              <polygon points="110,10 152,10 205,160 272,55 318,65 224,208 190,208" fill="#0B1354" />
            </g>

            {/* Wordmark: vilogistic */}
            <g transform="translate(20, 248)">
              <text
                fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontWeight="900"
                fontSize="64"
                letterSpacing="-1.5px"
              >
                <tspan fill="#FF7A00">vi</tspan>
                <tspan fill="#0B1354">logistic</tspan>
              </text>
            </g>
          </svg>
        </div>
      )}

      {showUploadOption && (
        <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -right-14 top-1 flex flex-col gap-0.5 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-[10px] z-20">
          <label className="cursor-pointer text-slate-600 hover:text-[#0B1F4D] whitespace-nowrap">
            <span>Ubah Logo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
          {customLogo && (
            <button
              onClick={handleResetLogo}
              className="text-red-600 hover:text-red-700 text-left whitespace-nowrap"
            >
              Reset Default
            </button>
          )}
        </div>
      )}
    </div>
  );
};
