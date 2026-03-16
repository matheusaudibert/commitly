"use client"

import { Flame, GitCommit } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StreakInfo {
  days: number
  startDate: string | null
  endDate: string | null
  lastCommitRepo: string | null
}

interface StreakCircleProps {
  streakInfo: StreakInfo | null
}

function streakColor(n: number): string | null {
  if (n === 0) return null       // sem streak — só o track muted aparece
  if (n >= 30) return "#c4b5fd"  // violet-300 (roxo claro)
  if (n >= 20) return "#34d399"  // emerald-400
  if (n >= 16) return "#10b981"  // emerald-500
  if (n >= 11) return "#047857"  // emerald-700
  return "#064e3b"                // emerald-900 (1–10)
}

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

function formatRange(start: string, end: string): string {
  const [, sm, sd] = start.split("-").map(Number)
  const [, em, ed] = end.split("-").map(Number)
  return `${sd} ${MONTHS_PT[sm - 1]} — ${ed} ${MONTHS_PT[em - 1]}`
}

const R = 56
const CX = 72
const CY = 72
const CIRCUMFERENCE = 2 * Math.PI * R
const ARC = CIRCUMFERENCE * 0.75   // 270°
const GAP = CIRCUMFERENCE * 0.25   // 90° gap at bottom

export function StreakCircle({ streakInfo }: StreakCircleProps) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-xl border border-border/60 bg-card p-5 gap-2">
      <div className="flex items-center gap-1.5 self-start">
        <Flame className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Streak</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        {streakInfo === null ? (
          <Skeleton className="size-36 rounded-full" />
        ) : (
          <>
            <div className="relative flex items-center justify-center" style={{ width: CX * 2, height: CY * 2 }}>
              <svg
                viewBox={`0 0 ${CX * 2} ${CY * 2}`}
                width={CX * 2}
                height={CY * 2}
              >
                {/* Background track */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={8}
                  strokeDasharray={`${ARC} ${GAP}`}
                  strokeLinecap="round"
                  transform={`rotate(135, ${CX}, ${CY})`}
                />
                {/* Colored arc — hidden when streak is 0 */}
                {streakColor(streakInfo.days) && (
                  <circle
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={streakColor(streakInfo.days)!}
                    strokeWidth={8}
                    strokeDasharray={`${ARC} ${GAP}`}
                    strokeLinecap="round"
                    transform={`rotate(135, ${CX}, ${CY})`}
                  />
                )}
              </svg>

              {/* Center number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold tabular-nums leading-none">
                  {streakInfo.days}
                </span>
              </div>
            </div>

            {streakInfo.days > 0 && streakInfo.startDate && streakInfo.endDate ? (
              <p className="text-xs text-muted-foreground">
                {formatRange(streakInfo.startDate, streakInfo.endDate)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum streak ativo</p>
            )}

            {/* Last commit repo */}
            {streakInfo.lastCommitRepo && (
              <div className="mt-3 w-full px-1">
                <p className="mb-1 text-[11px] text-muted-foreground">Último commit</p>
                <a
                  href={`https://github.com/${streakInfo.lastCommitRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-foreground/80 hover:text-foreground transition-colors truncate"
                >
                  <GitCommit className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{streakInfo.lastCommitRepo}</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
