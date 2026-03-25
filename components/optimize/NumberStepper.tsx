export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 60,
  sublabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <div className="text-xs font-semibold text-ink-soft">{label}</div>
        {sublabel && <div className="text-[10px] text-ink-muted mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-1.5" role="group" aria-label={label}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-display font-semibold text-ink" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}
