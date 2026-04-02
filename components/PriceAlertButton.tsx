'use client';

import { useState } from 'react';
import { PriceAlertModal } from './PriceAlertModal';

interface PriceAlertButtonProps {
  windowLabel: string;
  origin: string;
  startStr: string;
  endStr: string;
  currentPrice: number;
  currency: string;
  destination: string;
  className?: string;
}

export function PriceAlertButton({
  windowLabel,
  origin,
  startStr,
  endStr,
  currentPrice,
  currency,
  destination,
  className = '',
}: PriceAlertButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        aria-label="Set price alert for this flight"
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-coral transition-colors py-1 ${className}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        Price alert
      </button>

      <PriceAlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        windowLabel={windowLabel}
        origin={origin}
        startStr={startStr}
        endStr={endStr}
        currentPrice={currentPrice}
        currency={currency}
        destination={destination}
      />
    </>
  );
}
