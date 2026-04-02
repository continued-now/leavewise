'use client';

import { useState } from 'react';

interface AddWindowFormProps {
  onAdd: (window: { startStr: string; endStr: string; label: string; ptoDaysUsed: number }) => void;
}

export function AddWindowForm({ onAdd }: AddWindowFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [label, setLabel] = useState('');
  const [ptoDays, setPtoDays] = useState(0);

  const handleSubmit = () => {
    if (!startDate || !endDate || !label.trim()) return;
    if (endDate < startDate) return;

    onAdd({
      startStr: startDate,
      endStr: endDate,
      label: label.trim(),
      ptoDaysUsed: ptoDays,
    });

    setStartDate('');
    setEndDate('');
    setLabel('');
    setPtoDays(0);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-xs font-semibold text-ink">Add a PTO window</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="win-start" className="block text-[10px] font-semibold text-ink-muted mb-1">
            Start date
          </label>
          <input
            id="win-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={`${currentYear}-01-01`}
            max={`${currentYear}-12-31`}
            className="w-full bg-cream border border-border rounded-lg px-2.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>
        <div>
          <label htmlFor="win-end" className="block text-[10px] font-semibold text-ink-muted mb-1">
            End date
          </label>
          <input
            id="win-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || `${currentYear}-01-01`}
            max={`${currentYear}-12-31`}
            className="w-full bg-cream border border-border rounded-lg px-2.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="win-label" className="block text-[10px] font-semibold text-ink-muted mb-1">
            Label
          </label>
          <input
            id="win-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Summer vacation"
            maxLength={40}
            className="w-full bg-cream border border-border rounded-lg px-2.5 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>
        <div>
          <label htmlFor="win-pto" className="block text-[10px] font-semibold text-ink-muted mb-1">
            PTO days used
          </label>
          <input
            id="win-pto"
            type="number"
            value={ptoDays}
            onChange={(e) => setPtoDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
            min={0}
            max={30}
            className="w-full bg-cream border border-border rounded-lg px-2.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!startDate || !endDate || !label.trim() || endDate < startDate}
        className="w-full bg-teal text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Add window
      </button>
    </div>
  );
}
