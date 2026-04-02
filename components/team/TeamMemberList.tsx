'use client';

import type { TeamMember } from '@/lib/team';
import { formatDateShort } from '@/lib/team';

interface TeamMemberListProps {
  members: TeamMember[];
  currentMemberId: string | null;
  isCreator: boolean;
  onRemoveMember: (memberId: string) => void;
  onImportPlan: () => void;
  importedCount: number | null;
}

export function TeamMemberList({
  members,
  currentMemberId,
  isCreator,
  onRemoveMember,
  onImportPlan,
  importedCount,
}: TeamMemberListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Team members</h3>
        <span className="text-xs text-ink-muted">{members.length} member{members.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const isSelf = member.id === currentMemberId;
          const totalPTO = member.windows.reduce((sum, w) => sum + w.ptoDaysUsed, 0);

          return (
            <div
              key={member.id}
              className={`bg-white rounded-xl border p-4 ${
                isSelf ? 'border-teal/30 bg-teal-light/30' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: member.color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink truncate">{member.name}</span>
                      {isSelf && (
                        <span className="text-[9px] font-semibold text-teal bg-teal-light px-1.5 py-0.5 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-ink-muted">
                        {member.windows.length} window{member.windows.length !== 1 ? 's' : ''}
                      </span>
                      {totalPTO > 0 && (
                        <span className="text-[11px] text-ink-muted">
                          {totalPTO} PTO day{totalPTO !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelf && (
                    <button
                      onClick={onImportPlan}
                      className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
                      title="Import windows from your saved optimizer plan"
                    >
                      Import plan
                    </button>
                  )}
                  {isCreator && !isSelf && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="text-[10px] font-semibold text-ink-muted hover:text-coral transition-colors px-2 py-1 rounded-lg border border-border hover:border-coral/30"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Windows list */}
              {member.windows.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {member.windows.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] bg-cream rounded-lg px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.color }}
                        />
                        <span className="text-ink-soft truncate">{w.label}</span>
                      </div>
                      <span className="text-ink-muted shrink-0 ml-2">
                        {formatDateShort(w.startStr)} &ndash; {formatDateShort(w.endStr)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isSelf && member.windows.length === 0 && (
                <p className="text-[11px] text-ink-muted mt-2 italic">
                  No windows yet. Add one below or import from your saved plan.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {importedCount !== null && importedCount > 0 && (
        <div className="bg-sage-light border border-sage/20 rounded-lg px-3 py-2 text-xs text-sage">
          Imported {importedCount} window{importedCount !== 1 ? 's' : ''} from your saved plan.
        </div>
      )}
    </div>
  );
}
