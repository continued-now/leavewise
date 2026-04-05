'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTeamPlanning } from '@/hooks/useTeamPlanning';
import { TeamSetup } from '@/components/team/TeamSetup';
import { TeamCalendar } from '@/components/team/TeamCalendar';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { ConflictWarnings } from '@/components/team/ConflictWarnings';
import { CoverageGaps } from '@/components/team/CoverageGaps';
import { AddWindowForm } from '@/components/team/AddWindowForm';
import { detectConflicts, getCoverageGaps } from '@/lib/team';

const CURRENT_YEAR = new Date().getFullYear();

export default function TeamPage() {
  const {
    currentTeam,
    currentMember,
    isCreator,
    createTeam,
    joinTeam,
    leaveTeam,
    removeMember,
    addWindow,
    removeWindow,
    importFromSavedPlans,
  } = useTeamPlanning();

  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [calendarStart, setCalendarStart] = useState(new Date().getMonth());

  const conflicts = useMemo(
    () => (currentTeam ? detectConflicts(currentTeam.members) : []),
    [currentTeam]
  );

  const coverageGaps = useMemo(
    () => (currentTeam ? getCoverageGaps(currentTeam.members, CURRENT_YEAR) : []),
    [currentTeam]
  );

  const handleImport = useCallback(() => {
    const count = importFromSavedPlans();
    setImportedCount(count);
    if (count === 0) {
      setImportedCount(-1); // signal "no plans found"
    }
  }, [importFromSavedPlans]);

  const handleCopyCode = useCallback(() => {
    if (!currentTeam) return;
    navigator.clipboard.writeText(currentTeam.code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, [currentTeam]);

  const handlePrevMonths = () => setCalendarStart((s) => Math.max(0, s - 3));
  const handleNextMonths = () => setCalendarStart((s) => Math.min(9, s + 3));

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
            >
              Leavewise
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-semibold text-ink">Team</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/optimize"
              className="text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
            >
              Optimizer
            </Link>
            {currentTeam && (
              <button
                onClick={leaveTeam}
                className="text-xs text-ink-muted hover:text-coral transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-coral/30"
              >
                Leave team
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!currentTeam ? (
          /* No team — show setup */
          <TeamSetup onCreateTeam={createTeam} onJoinTeam={joinTeam} />
        ) : (
          /* Has a team — show dashboard */
          <div className="space-y-8">
            {/* Team header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-semibold text-ink">{currentTeam.name}</h1>
                <p className="text-sm text-ink-muted mt-1">
                  {currentTeam.members.length} member{currentTeam.members.length !== 1 ? 's' : ''}
                  {' \u00b7 '}{CURRENT_YEAR}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-cream rounded-xl border border-border px-4 py-2.5">
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">Code</span>
                  <span className="text-sm font-mono font-bold text-teal tracking-[0.15em] select-all">
                    {currentTeam.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-ink-muted hover:text-teal transition-colors ml-1"
                    title="Copy team code"
                  >
                    {codeCopied ? (
                      <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-display font-semibold text-ink">Team calendar</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonths}
                    disabled={calendarStart === 0}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-teal hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextMonths}
                    disabled={calendarStart >= 9}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-teal hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              <TeamCalendar
                members={currentTeam.members}
                year={CURRENT_YEAR}
                startMonth={calendarStart}
              />
            </div>

            {/* Conflict warnings */}
            {conflicts.length > 0 && <ConflictWarnings conflicts={conflicts} />}

            {/* Two-column layout: members + coverage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Members + add window */}
              <div className="space-y-4">
                <TeamMemberList
                  members={currentTeam.members}
                  currentMemberId={currentMember?.id ?? null}
                  isCreator={isCreator}
                  onRemoveMember={removeMember}
                  onImportPlan={handleImport}
                  importedCount={importedCount}
                />

                {importedCount === -1 && (
                  <div className="bg-cream border border-border rounded-lg px-3 py-2 text-xs text-ink-muted">
                    No saved plans found. Use the{' '}
                    <Link href="/optimize" className="text-teal hover:underline">
                      optimizer
                    </Link>{' '}
                    first, then save a plan to import it here.
                  </div>
                )}

                {/* Add window form (for current member) */}
                {currentMember && (
                  <AddWindowForm onAdd={addWindow} />
                )}

                {/* Remove own windows */}
                {currentMember && currentMember.windows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-ink-muted">Your windows</h4>
                    {currentMember.windows.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2"
                      >
                        <span className="text-xs text-ink">{w.label}</span>
                        <button
                          onClick={() => removeWindow(i)}
                          className="text-[10px] text-ink-muted hover:text-coral transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Coverage gaps */}
              <div>
                <CoverageGaps gaps={coverageGaps} />

                {/* Quick stats */}
                {currentTeam.members.some((m) => m.windows.length > 0) && (
                  <div className="mt-6 bg-white rounded-xl border border-border p-4">
                    <h3 className="text-xs font-semibold text-ink mb-3">Team summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <div className="text-lg font-display font-semibold text-teal">
                          {currentTeam.members.reduce((s, m) => s + m.windows.length, 0)}
                        </div>
                        <div className="text-[10px] text-ink-muted">Total windows</div>
                      </div>
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <div className="text-lg font-display font-semibold text-coral">
                          {conflicts.length}
                        </div>
                        <div className="text-[10px] text-ink-muted">Overlaps</div>
                      </div>
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <div className="text-lg font-display font-semibold text-sage">
                          {currentTeam.members.reduce((s, m) => s + m.windows.reduce((ws, w) => ws + w.ptoDaysUsed, 0), 0)}
                        </div>
                        <div className="text-[10px] text-ink-muted">Total PTO days</div>
                      </div>
                      <div className="bg-cream rounded-lg px-3 py-2">
                        <div className="text-lg font-display font-semibold text-amber">
                          {coverageGaps.length}
                        </div>
                        <div className="text-[10px] text-ink-muted">Coverage gap days</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
