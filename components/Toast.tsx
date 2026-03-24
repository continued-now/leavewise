'use client';

import { useState, useCallback, useRef, createContext, useContext } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'info';
}

interface ToastContextValue {
  toast: (message: string, type?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
              animate-[toast-in_0.25s_ease-out,toast-out_0.2s_ease-in_2s_forwards]
              ${t.type === 'success'
                ? 'bg-ink text-white'
                : 'bg-white text-ink border border-border'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {t.type === 'success' && (
                <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
