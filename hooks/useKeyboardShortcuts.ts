'use client';

import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
  group: 'navigation' | 'actions' | 'calendar';
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  enabled = true
): void {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const sc of shortcuts) {
        const keyMatch =
          e.key === sc.key || e.key.toLowerCase() === sc.key.toLowerCase();
        if (!keyMatch) continue;

        const wantCtrl = sc.ctrl ?? false;
        const wantMeta = sc.meta ?? false;
        const wantShift = sc.shift ?? false;

        // For shortcuts that need Cmd/Ctrl, accept either on any platform
        const ctrlOrMeta = e.ctrlKey || e.metaKey;
        const ctrlMatch = wantCtrl || wantMeta ? ctrlOrMeta : !e.ctrlKey && !e.metaKey;
        const shiftMatch = wantShift ? e.shiftKey : !e.shiftKey;

        if (!ctrlMatch || !shiftMatch) continue;

        // Skip letter/number shortcuts when typing in form elements
        const isModifier = wantCtrl || wantMeta;
        if (!isModifier && isInputFocused()) continue;

        e.preventDefault();
        sc.handler();
        return;
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);
}
