import React, { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { resolveBundledAssetUrl } from '../utils/assetResolver';

interface DishImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const DishImage: React.FC<DishImageProps> = ({ src, alt, className = '' }) => {
  const resolvedSrc = resolveBundledAssetUrl(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full aspect-[16/10] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-orange-400 ${className}`}
      >
        <UtensilsCrossed className="w-7 h-7 mb-1.5 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-300 px-3 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full aspect-[16/10] object-cover bg-slate-800 ${className}`}
    />
  );
};
