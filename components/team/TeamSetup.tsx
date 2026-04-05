'use client';

import { useState } from 'react';

interface TeamSetupProps {
  onCreateTeam: (teamName: string, memberName: string) => { teamId: string; code: string };
  onJoinTeam: (code: string, memberName: string) => { success: boolean; error?: string };
}

export function TeamSetup({ onCreateTeam, onJoinTeam }: TeamSetupProps) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const handleCreate = () => {
    if (!teamName.trim() || !memberName.trim()) return;
    const result = onCreateTeam(teamName.trim(), memberName.trim());
    setCreatedCode(result.code);
  };

  const handleJoin = () => {
    if (!joinCode.trim() || !memberName.trim()) return;
    setError('');
    const result = onJoinTeam(joinCode.trim(), memberName.trim());
    if (!result.success) {
      setError(result.error ?? 'Failed to join team');
    }
  };

  if (createdCode) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-display font-semibold text-ink mb-2">Team created!</h2>
        <p className="text-sm text-ink-muted mb-6">Share this code with your teammates so they can join.</p>
        <div className="bg-cream rounded-xl border border-border px-6 py-4 mb-4">
          <div className="text-3xl font-mono font-bold text-teal tracking-[0.25em] select-all">
            {createdCode}
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(createdCode).catch(() => {});
          }}
          className="text-sm font-semibold text-teal hover:text-teal-hover transition-colors"
        >
          Copy code
        </button>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-semibold text-ink mb-2">Team PTO Planning</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Coordinate time off with your team. See everyone&apos;s plans at a glance, spot overlaps, and avoid coverage gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('create')}
            className="bg-white rounded-2xl border border-border p-6 text-left hover:border-teal/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center mb-3 group-hover:bg-teal/20 transition-colors">
              <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1">Create a team</h3>
            <p className="text-xs text-ink-muted leading-relaxed">Start a new team and invite others with a share code.</p>
          </button>

          <button
            onClick={() => setMode('join')}
            className="bg-white rounded-2xl border border-border p-6 text-left hover:border-teal/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mb-3 group-hover:bg-coral/20 transition-colors">
              <svg className="w-5 h-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1">Join a team</h3>
            <p className="text-xs text-ink-muted leading-relaxed">Enter a 6-character code to join an existing team.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 max-w-md mx-auto">
      <button
        onClick={() => { setMode('choose'); setError(''); }}
        className="flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors mb-6"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      <h2 className="text-xl font-display font-semibold text-ink mb-1">
        {mode === 'create' ? 'Create a team' : 'Join a team'}
      </h2>
      <p className="text-xs text-ink-muted mb-6">
        {mode === 'create'
          ? 'Set up your team and get a share code.'
          : 'Enter the code your teammate shared.'}
      </p>

      <div className="space-y-4">
        {mode === 'create' && (
          <div>
            <label htmlFor="team-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Team name
            </label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Engineering, Marketing"
              maxLength={40}
              className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>
        )}

        {mode === 'join' && (
          <div>
            <label htmlFor="join-code" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Team code
            </label>
            <input
              id="join-code"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="e.g. AB3XY7"
              maxLength={6}
              className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink font-mono uppercase tracking-widest placeholder:text-ink-muted/50 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>
        )}

        <div>
          <label htmlFor="member-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Your name
          </label>
          <input
            id="member-name"
            type="text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="e.g. Alice"
            maxLength={30}
            className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>

        {error && (
          <div className="bg-coral-light border border-coral/20 rounded-lg px-3 py-2 text-xs text-coral">
            {error}
          </div>
        )}

        <button
          onClick={mode === 'create' ? handleCreate : handleJoin}
          disabled={mode === 'create' ? !teamName.trim() || !memberName.trim() : !joinCode.trim() || !memberName.trim()}
          className="w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {mode === 'create' ? 'Create Team' : 'Join Team'}
        </button>
      </div>
    </div>
  );
}
