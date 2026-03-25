'use client';

import { useState } from 'react';

export function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 group"
      >
        <span className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70 group-hover:text-ink-muted transition-colors flex items-center gap-1.5 shrink-0">
          {title}
          {!open && badge && (
            <span className="bg-teal/10 text-teal text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-normal normal-case border border-teal/15">
              {badge}
            </span>
          )}
        </span>
        <span className="flex-1 h-px bg-border" />
        <svg
          className={`w-3 h-3 shrink-0 text-ink-muted/50 group-hover:text-ink-muted transition-all duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
