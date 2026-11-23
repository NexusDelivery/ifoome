import React, { useState } from 'react';

interface BrandMarkProps {
  compact?: boolean;
  onDark?: boolean;
  logoUrl?: string;
  alt?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  compact = false,
  onDark = false,
  logoUrl,
  alt = 'Logotipo do restaurante',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-9 h-9 rounded-xl object-cover border border-[#EAE0D5] bg-[#FFFFFF] shrink-0 shadow-sm"
        />
      ) : (
        <span
          className="w-9 h-9 rounded-xl bg-[#F47B35] flex items-center justify-center shadow-sm shrink-0"
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 14C4 9.58172 7.58172 6 12 6C16.4183 6 20 9.58172 20 14H4Z"
              fill="#FFF8EF"
            />
            <circle cx="12" cy="4.2" r="1.4" fill="#FFF8EF" />
            <path
              d="M3 16.5H21"
              stroke="#FFF8EF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M6.5 19.5H17.5"
              stroke="#FFF8EF"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>
        </span>
      )}
      <span className="font-display font-extrabold tracking-tight text-xl leading-none">
        <span className={onDark ? 'text-[#FFF8EF]' : 'text-[#382B25]'}>i</span>
        <span className="text-[#D94B3D]">Foome</span>
        {!compact && (
          <span
            className={`ml-1.5 text-sm font-semibold tracking-normal ${
              onDark ? 'text-[#FFF8EF]/75' : 'text-[#6E5D55]'
            }`}
          >
            Delivery
          </span>
        )}
      </span>
    </span>
  );
};
