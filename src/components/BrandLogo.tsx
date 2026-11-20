import React from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'compact';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'default' }) => {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width={variant === 'compact' ? 28 : 34}
        height={variant === 'compact' ? 28 : 34}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="10" fill="#287A55" />
        <path
          d="M9 22C9 16.4772 13.0294 12 18 12C22.9706 12 27 16.4772 27 22H9Z"
          fill="#FFFFFF"
        />
        <rect x="7" y="23.5" width="22" height="3" rx="1.5" fill="#F4C95D" />
        <circle cx="18" cy="9.5" r="2" fill="#F4C95D" />
      </svg>
      <span
        className={`font-display font-extrabold tracking-tight leading-none ${
          variant === 'compact' ? 'text-xl' : 'text-2xl'
        }`}
      >
        <span className="text-[#287A55]">i</span>
        <span className="text-[#263238]">Foome</span>
      </span>
    </span>
  );
};
