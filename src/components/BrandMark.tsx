import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface BrandMarkProps {
  compact?: boolean;
  logoUrl?: string;
  alt?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  compact = false,
  logoUrl,
  alt = 'Logotipo Nexus Delivery',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <span className="inline-flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0 select-none group min-w-0">
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover border border-slate-700 bg-slate-800 shrink-0 shadow-lg shadow-orange-500/15"
        />
      ) : (
        <span
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0"
          aria-hidden="true"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </span>
      )}
      <span className="flex flex-col text-left min-w-0">
        <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
          <span>NEXUS</span>
          <span className="text-orange-400 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
            Delivery
          </span>
        </span>
        {!compact && (
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-none truncate">
            Sabor na velocidade da luz
          </span>
        )}
      </span>
    </span>
  );
};
