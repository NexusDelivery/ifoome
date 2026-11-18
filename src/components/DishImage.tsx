import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface DishImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export const DishImage: React.FC<DishImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[4/3]',
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${aspectClass} w-full bg-gradient-to-br from-[#F7EFE5] to-[#EFE2D2] flex flex-col items-center justify-center p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-full bg-[#FFF8EF] border border-[#E5D6C5] flex items-center justify-center text-[#F47B35] mb-2">
          <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-[#6E5D55] line-clamp-2 max-w-[16ch]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} w-full overflow-hidden bg-[#F7EFE5] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
  );
};
