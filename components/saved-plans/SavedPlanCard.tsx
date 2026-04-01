'use client';

import { useState, useRef, useEffect } from 'react';
import type { SavedPlanMeta } from '@/lib/types';

const COUNTRY_FLAGS: Record<string, string> = { US: '🇺🇸', KR: '🇰🇷' };
const STRATEGY_LABELS: Record<string, string> = { short: 'Short', balanced: 'Balanced', long: 'Long' };

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface SavedPlanCardProps {
  plan: SavedPlanMeta;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  loadLabel: string;
  deleteLabel: string;
  confirmDeleteLabel: string;
}

export function SavedPlanCard({
  plan,
  selected,
  onToggleSelect,
  onLoad,
  onDelete,
  onRename,
  loadLabel,
  deleteLabel,
  confirmDeleteLabel,
}: SavedPlanCardProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(plan.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  const handleRenameConfirm = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== plan.name) {
      onRename(plan.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all ${selected ? 'border-teal shadow-sm' : 'border-border hover:border-teal/30'} p-4`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleSelect(plan.id)}
          className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
            selected ? 'bg-teal border-teal' : 'border-border hover:border-teal/50'
          }`}
          aria-label={selected ? 'Deselect for comparison' : 'Select for comparison'}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Name (click to edit) */}
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameConfirm();
                if (e.key === 'Escape') { setEditing(false); setEditName(plan.name); }
              }}
              maxLength={50}
              className="text-sm font-semibold text-ink bg-cream border border-teal/30 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-teal/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => { setEditing(true); setEditName(plan.name); }}
              className="text-sm font-semibold text-ink truncate text-left hover:text-teal transition-colors block w-full"
              title="Click to rename"
            >
              {plan.name}
            </button>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-ink-muted">{relativeTime(plan.updatedAt)}</span>
            <span className="text-[10px]">{COUNTRY_FLAGS[plan.country] ?? ''}</span>
            <span className="text-[10px] text-ink-muted">{plan.year}</span>
            <span className="text-[10px] font-semibold bg-teal-light text-teal px-1.5 py-0.5 rounded">
              {STRATEGY_LABELS[plan.strategy] ?? plan.strategy}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
            <span><span className="font-semibold text-coral">{plan.totalDaysOff}</span> days off</span>
            <span><span className="font-semibold text-teal">{plan.totalLeaveUsed}</span> PTO</span>
            <span><span className="font-semibold text-sage">{plan.efficiency}x</span></span>
            <span><span className="font-semibold text-ink">{plan.windowCount}</span> trips</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
        <button
          type="button"
          onClick={() => onLoad(plan.id)}
          className="flex-1 text-[10px] font-semibold bg-teal text-white py-1.5 rounded-lg hover:bg-teal-hover transition-colors"
        >
          {loadLabel}
        </button>
        {confirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { onDelete(plan.id); setConfirmingDelete(false); }}
              className="text-[10px] font-semibold text-white bg-coral py-1.5 px-3 rounded-lg hover:bg-coral/80 transition-colors"
            >
              {confirmDeleteLabel}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-[10px] text-ink-muted py-1.5 px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-[10px] font-semibold text-coral hover:text-coral/80 py-1.5 px-3 rounded-lg border border-coral/20 hover:border-coral/40 transition-colors"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
