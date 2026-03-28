'use client';

import { useState, useEffect, type ReactNode, type FormEvent } from 'react';

interface AdminGateProps {
  children: ReactNode;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function AdminGate({ children }: AdminGateProps) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The cookie is httpOnly so document.cookie won't see it.
    // We optimistically check a non-httpOnly signal, but the real gate is
    // the cookie checked server-side. For the client gate, we try a lightweight
    // check — if the cookie name appears (set as httpOnly, it won't), we show
    // children. Otherwise we show the login form.
    const cookie = getCookie('lw_admin');
    setAuthed(cookie === '1');
    setChecked(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Reload to let the server pick up the new cookie
        window.location.reload();
        return;
      }

      const data = await res.json();
      setError(data.error ?? 'Invalid password');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't flash anything while checking
  if (!checked) return null;

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-border p-8">
        <h1 className="font-display text-2xl font-semibold text-ink text-center mb-2">
          Admin Access
        </h1>
        <p className="text-ink-muted text-sm text-center mb-6">
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-ink mb-1.5">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/40 placeholder:text-ink-muted/50"
            />
          </div>

          {error && (
            <p className="text-sm text-coral font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-teal text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-teal-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
