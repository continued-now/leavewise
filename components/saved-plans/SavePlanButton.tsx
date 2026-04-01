'use client';

import { useState, useRef, useEffect } from 'react';

interface SavePlanButtonProps {
  canSave: boolean;
  defaultName: string;
  onSave: (name: string) => void;
  onLimitReached: () => void;
  label: string;
}

export function SavePlanButton({ canSave, defaultName, onSave, onLimitReached, label }: SavePlanButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      setName(defaultName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [expanded, defaultName]);

  const handleClick = () => {
    if (!canSave) {
      onLimitReached();
      return;
    }
    setExpanded(true);
  };

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setExpanded(false);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') { setExpanded(false); setName(''); }
  };

  if (expanded) {
    return (
      <div className="flex items-center gap-1 bg-white border border-teal/30 rounded-lg overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={50}
          className="w-36 text-[10px] px-2 py-1.5 bg-transparent text-ink focus:outline-none"
          placeholder="Plan name..."
        />
        <button
          type="button"
          onClick={handleConfirm}
          className="px-2 py-1.5 text-teal hover:bg-teal-light transition-colors"
          aria-label="Confirm save"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => { setExpanded(false); setName(''); }}
          className="px-2 py-1.5 text-ink-muted hover:text-coral hover:bg-coral-light transition-colors"
          aria-label="Cancel"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      {label}
    </button>
  );
}
