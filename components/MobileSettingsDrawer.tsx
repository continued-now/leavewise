'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface MobileSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileSettingsDrawer({ open, onClose, children }: MobileSettingsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setDragOffset(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Only allow drag from the handle area (top 40px of drawer)
    const drawer = drawerRef.current;
    if (!drawer) return;
    const rect = drawer.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    if (touchY - rect.top < 40) {
      dragStartY.current = touchY;
      isDragging.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;
    // Only allow dragging downward
    if (diff > 0) {
      setDragOffset(diff);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    dragStartY.current = null;
    // If dragged more than 100px down, close
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
  }, [dragOffset, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-50 bg-black/30 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slide-up"
        style={{
          maxHeight: '85vh',
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset > 0 ? 'none' : 'transform 0.3s ease-out',
        }}
        role="dialog"
        aria-label="Settings"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grab handle */}
        <div className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
          <span className="text-sm font-semibold text-ink">Settings</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-cream transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(85vh - 80px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
