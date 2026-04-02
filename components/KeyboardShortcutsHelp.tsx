'use client';

import { useEffect, useRef } from 'react';

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['S'], description: 'Toggle sidebar' },
      { keys: ['1'], description: 'Short breaks strategy' },
      { keys: ['2'], description: 'Balanced strategy' },
      { keys: ['3'], description: 'Long trips strategy' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['\u2318/Ctrl', 'Enter'], description: 'Optimize PTO' },
      { keys: ['E'], description: 'Export all to calendar' },
      { keys: ['P'], description: 'Print plan' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    title: 'Calendar',
    shortcuts: [
      { keys: ['\u2190'], description: 'Previous months' },
      { keys: ['\u2192'], description: 'Next months' },
      { keys: ['Esc'], description: 'Close modals / panels' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-cream border border-border rounded-md text-[11px] font-mono font-semibold text-ink-soft shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        ref={panelRef}
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-semibold text-ink">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1"
            aria-label="Close shortcuts panel"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-teal uppercase tracking-wide mb-2.5">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.description}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-cream transition-colors"
                  >
                    <span className="text-sm text-ink">{sc.description}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-[10px] text-ink-muted">+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-[11px] text-ink-muted text-center">
            Press <Kbd>?</Kbd> anytime to show this panel
          </p>
        </div>
      </div>
    </div>
  );
}
