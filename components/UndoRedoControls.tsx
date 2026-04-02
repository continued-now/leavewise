'use client';

import { useEffect, useCallback } from 'react';

interface UndoRedoControlsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
}

export function UndoRedoControls({
  undo,
  redo,
  canUndo,
  canRedo,
  historySize,
}: UndoRedoControlsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    },
    [undo, redo, canUndo, canRedo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Only show when there's something to undo or redo
  if (!canUndo && !canRedo) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 bg-white rounded-xl border border-border shadow-lg px-2 py-1.5 animate-fade-in print:hidden">
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        title={`Undo (${modKey}+Z)`}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:text-teal hover:bg-teal-light disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-muted transition-colors"
      >
        <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
        {historySize > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-teal text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {historySize}
          </span>
        )}
      </button>
      <div className="w-px h-5 bg-border" />
      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        title={`Redo (${modKey}+Shift+Z)`}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:text-teal hover:bg-teal-light disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-muted transition-colors"
      >
        <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
        </svg>
      </button>
    </div>
  );
}
