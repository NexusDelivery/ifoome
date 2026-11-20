import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface DishImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const DishImage: React.FC<DishImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full aspect-[16/10] flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF3E6] to-[#FFF8EF] text-[#F47B35] ${className}`}
      >
        <UtensilsCrossed className="w-7 h-7 mb-1.5 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-[#6E5D55] px-3 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full aspect-[16/10] object-cover ${className}`}
    />
  );
};
