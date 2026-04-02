'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Team, TeamMember } from '@/lib/team';
import { generateTeamCode, generateMemberId, MEMBER_COLORS } from '@/lib/team';

const STORAGE_KEY = 'leavewise_teams_v1';

interface TeamsStore {
  version: 1;
  teams: Team[];
  currentTeamId: string | null;
  currentMemberId: string | null;
}

function loadStore(): TeamsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, teams: [], currentTeamId: null, currentMemberId: null };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return { version: 1, teams: [], currentTeamId: null, currentMemberId: null };
    return parsed as TeamsStore;
  } catch {
    return { version: 1, teams: [], currentTeamId: null, currentMemberId: null };
  }
}

function saveStore(store: TeamsStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or private browsing
  }
}

export function useTeamPlanning() {
  const [store, setStore] = useState<TeamsStore>(() => {
    if (typeof window === 'undefined') {
      return { version: 1, teams: [], currentTeamId: null, currentMemberId: null };
    }
    return loadStore();
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    setStore(loadStore());
  }, []);

  // Persist on change
  useEffect(() => {
    saveStore(store);
  }, [store]);

  const currentTeam = store.teams.find((t) => t.id === store.currentTeamId) ?? null;
  const currentMember = currentTeam?.members.find((m) => m.id === store.currentMemberId) ?? null;

  const createTeam = useCallback((teamName: string, memberName: string) => {
    const teamId = generateMemberId();
    const memberId = generateMemberId();
    const code = generateTeamCode();

    const member: TeamMember = {
      id: memberId,
      name: memberName,
      color: MEMBER_COLORS[0].value,
      windows: [],
      joinedAt: Date.now(),
    };

    const team: Team = {
      id: teamId,
      code,
      name: teamName,
      createdAt: Date.now(),
      members: [member],
    };

    setStore((s) => ({
      ...s,
      teams: [...s.teams, team],
      currentTeamId: teamId,
      currentMemberId: memberId,
    }));

    return { teamId, code };
  }, []);

  const joinTeam = useCallback((code: string, memberName: string): { success: boolean; error?: string } => {
    const team = store.teams.find((t) => t.code.toUpperCase() === code.toUpperCase());
    if (!team) return { success: false, error: 'Team not found. Check the code and try again.' };

    // Check if name is taken
    if (team.members.some((m) => m.name.toLowerCase() === memberName.toLowerCase())) {
      return { success: false, error: 'That name is already taken in this team.' };
    }

    const memberId = generateMemberId();
    const colorIndex = team.members.length % MEMBER_COLORS.length;

    const member: TeamMember = {
      id: memberId,
      name: memberName,
      color: MEMBER_COLORS[colorIndex].value,
      windows: [],
      joinedAt: Date.now(),
    };

    setStore((s) => ({
      ...s,
      teams: s.teams.map((t) =>
        t.id === team.id ? { ...t, members: [...t.members, member] } : t
      ),
      currentTeamId: team.id,
      currentMemberId: memberId,
    }));

    return { success: true };
  }, [store.teams]);

  const leaveTeam = useCallback(() => {
    if (!currentTeam || !currentMember) return;

    setStore((s) => {
      const updatedTeams = s.teams
        .map((t) =>
          t.id === currentTeam.id
            ? { ...t, members: t.members.filter((m) => m.id !== currentMember.id) }
            : t
        )
        .filter((t) => t.members.length > 0); // Remove empty teams

      return {
        ...s,
        teams: updatedTeams,
        currentTeamId: null,
        currentMemberId: null,
      };
    });
  }, [currentTeam, currentMember]);

  const removeMember = useCallback((memberId: string) => {
    if (!currentTeam) return;

    setStore((s) => {
      const updatedTeams = s.teams
        .map((t) =>
          t.id === currentTeam.id
            ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
            : t
        )
        .filter((t) => t.members.length > 0);

      // If we removed ourselves
      const isSelf = memberId === s.currentMemberId;
      return {
        ...s,
        teams: updatedTeams,
        currentTeamId: isSelf ? null : s.currentTeamId,
        currentMemberId: isSelf ? null : s.currentMemberId,
      };
    });
  }, [currentTeam]);

  const addWindow = useCallback(
    (window: TeamMember['windows'][0]) => {
      if (!currentTeam || !currentMember) return;

      setStore((s) => ({
        ...s,
        teams: s.teams.map((t) =>
          t.id === currentTeam.id
            ? {
                ...t,
                members: t.members.map((m) =>
                  m.id === currentMember.id
                    ? { ...m, windows: [...m.windows, window] }
                    : m
                ),
              }
            : t
        ),
      }));
    },
    [currentTeam, currentMember]
  );

  const removeWindow = useCallback(
    (windowIndex: number) => {
      if (!currentTeam || !currentMember) return;

      setStore((s) => ({
        ...s,
        teams: s.teams.map((t) =>
          t.id === currentTeam.id
            ? {
                ...t,
                members: t.members.map((m) =>
                  m.id === currentMember.id
                    ? { ...m, windows: m.windows.filter((_, i) => i !== windowIndex) }
                    : m
                ),
              }
            : t
        ),
      }));
    },
    [currentTeam, currentMember]
  );

  const importFromSavedPlans = useCallback(() => {
    if (!currentTeam || !currentMember) return 0;

    // Load saved plans from the optimizer
    try {
      const raw = localStorage.getItem('leavewise_saved_plans_v1');
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (!parsed?.plans?.length) return 0;

      // Take the most recent plan
      const plan = parsed.plans[0];
      if (!plan?.result?.windows?.length) return 0;

      const newWindows: TeamMember['windows'][0][] = plan.result.windows.map(
        (w: { startDate: string; endDate: string; label: string; ptoDaysUsed: number }) => ({
          startStr: typeof w.startDate === 'string' ? w.startDate.slice(0, 10) : w.startDate,
          endStr: typeof w.endDate === 'string' ? w.endDate.slice(0, 10) : w.endDate,
          label: w.label,
          ptoDaysUsed: w.ptoDaysUsed,
        })
      );

      setStore((s) => ({
        ...s,
        teams: s.teams.map((t) =>
          t.id === currentTeam.id
            ? {
                ...t,
                members: t.members.map((m) =>
                  m.id === currentMember.id
                    ? { ...m, windows: newWindows }
                    : m
                ),
              }
            : t
        ),
      }));

      return newWindows.length;
    } catch {
      return 0;
    }
  }, [currentTeam, currentMember]);

  // Check if current member is the team creator (first member)
  const isCreator = currentTeam ? currentTeam.members[0]?.id === currentMember?.id : false;

  return {
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
  };
}
