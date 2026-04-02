'use client';

import { useState, useCallback, useRef } from 'react';

interface UndoRedoOptions {
  maxHistory?: number;
}

function serialize<T>(value: T): string {
  if (value instanceof Set) {
    return JSON.stringify([...value].sort());
  }
  return JSON.stringify(value);
}

export function useUndoRedo<T>(initialState: T, options?: UndoRedoOptions) {
  const maxHistory = options?.maxHistory ?? 50;

  const [present, setPresent] = useState<T>(initialState);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  // Force re-render when past/future change (for canUndo/canRedo)
  const [, forceRender] = useState(0);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setPresent((prev) => {
        const next = typeof newState === 'function'
          ? (newState as (prev: T) => T)(prev)
          : newState;

        // Skip if identical (serialize Sets as sorted arrays for comparison)
        if (serialize(prev) === serialize(next)) {
          return prev;
        }

        // Push current present to past
        pastRef.current = [...pastRef.current, prev].slice(-maxHistory);
        // Clear future on new action
        futureRef.current = [];
        forceRender((n) => n + 1);
        return next;
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setPresent((prev) => {
      if (pastRef.current.length === 0) return prev;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      forceRender((n) => n + 1);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setPresent((prev) => {
      if (futureRef.current.length === 0) return prev;
      const next = futureRef.current[0];
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current, prev];
      forceRender((n) => n + 1);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    forceRender((n) => n + 1);
  }, []);

  return {
    state: present,
    setState,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    historySize: pastRef.current.length,
    clear,
  };
}
