// Team PTO planning types and utilities

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  windows: { startStr: string; endStr: string; label: string; ptoDaysUsed: number }[];
  joinedAt: number;
}

export interface Team {
  id: string;
  code: string; // 6-char share code
  name: string;
  createdAt: number;
  members: TeamMember[];
}

export interface Conflict {
  memberA: string;
  memberB: string;
  overlapStart: string;
  overlapEnd: string;
  overlapDays: number;
}

// Member colors — no purple per design spec
export const MEMBER_COLORS = [
  { name: 'Teal', value: '#1A6363' },
  { name: 'Coral', value: '#D95740' },
  { name: 'Sage', value: '#4A7C5E' },
  { name: 'Amber', value: '#C4872A' },
  { name: 'Sky', value: '#2D7A9C' },
  { name: 'Rose', value: '#B85C5C' },
  { name: 'Forest', value: '#3B6B4E' },
  { name: 'Slate', value: '#5A6B7A' },
];

export function generateTeamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateMemberId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/** Get all dates between start and end (inclusive), as YYYY-MM-DD strings */
function getDateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/** Detect PTO overlap conflicts between members */
export function detectConflicts(members: TeamMember[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];

      for (const wA of a.windows) {
        for (const wB of b.windows) {
          // Check overlap: max(startA, startB) <= min(endA, endB)
          const overlapStart = wA.startStr > wB.startStr ? wA.startStr : wB.startStr;
          const overlapEnd = wA.endStr < wB.endStr ? wA.endStr : wB.endStr;

          if (overlapStart <= overlapEnd) {
            const overlapDays = getDateRange(overlapStart, overlapEnd).length;
            conflicts.push({
              memberA: a.name,
              memberB: b.name,
              overlapStart,
              overlapEnd,
              overlapDays,
            });
          }
        }
      }
    }
  }

  // Sort by severity (most overlap first)
  conflicts.sort((a, b) => b.overlapDays - a.overlapDays);
  return conflicts;
}

/** Get dates in a year where no team member is available (everyone is off) */
export function getCoverageGaps(members: TeamMember[], year: number): string[] {
  if (members.length < 2) return [];

  // Build a set of all dates where each member is off
  const memberOffDates: Set<string>[] = members.map((m) => {
    const offDates = new Set<string>();
    for (const w of m.windows) {
      for (const d of getDateRange(w.startStr, w.endStr)) {
        offDates.add(d);
      }
    }
    return offDates;
  });

  // Find workdays where ALL members are off
  const gaps: string[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    const dow = current.getDay();
    // Skip weekends
    if (dow !== 0 && dow !== 6) {
      const allOff = memberOffDates.every((offDates) => offDates.has(dateStr));
      if (allOff) {
        gaps.push(dateStr);
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return gaps;
}

/** Format a date string for display */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
