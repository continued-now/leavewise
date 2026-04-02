'use client';

import { useState, useCallback, useRef, type ReactNode } from 'react';

interface CalendarTooltipProps {
  content: string | undefined;
  children: ReactNode;
}

/**
 * Lightweight tooltip for calendar day cells.
 * Shows on hover (desktop) with a brief delay.
 * Positioned above the element, falls back to below if near top.
 */
export function CalendarTooltip({ content, children }: CalendarTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; above: boolean }>({ top: 0, left: 0, above: true });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!content) return;
    timerRef.current = setTimeout(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const above = rect.top > 60;
      setPosition({
        top: above ? rect.top - 4 : rect.bottom + 4,
        left: rect.left + rect.width / 2,
        above,
      });
      setVisible(true);
    }, 300);
  }, [content]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{
            top: position.above ? position.top : position.top,
            left: position.left,
            transform: position.above
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)',
          }}
        >
          <div className="bg-ink text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg max-w-[200px] text-center leading-snug whitespace-normal">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
