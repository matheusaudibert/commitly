"use client"

import { useEffect, useState, useCallback } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity } from "lucide-react"

const CELL = 11
const GAP  = 3
const STEP = CELL + GAP

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
const DAYS_PT   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function cellColor(n: number) {
  if (n === 0) return "bg-muted/50"
  if (n === 1) return "bg-emerald-900"
  if (n === 2) return "bg-emerald-700"
  if (n <= 4)  return "bg-emerald-500"
  return "bg-emerald-400"
}

function buildGrid(today: Date) {
  const start = new Date(today)
  start.setDate(start.getDate() - 52 * 7 - today.getDay())
  start.setHours(0, 0, 0, 0)

  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= today) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function getMonthLabels(weeks: Date[][]) {
  const labels: { col: number; label: string }[] = []
  let last = -1
  weeks.forEach((week, col) => {
    const m = week[0].getMonth()
    if (m !== last) { labels.push({ col, label: MONTHS_PT[m] }); last = m }
  })
  return labels
}

interface ActivityGridProps {
  refreshKey?: number
  onStreakChange?: (streak: number, startDate: string | null, endDate: string | null, lastCommitRepo: string | null) => void
}

export function ActivityGrid({ refreshKey = 0, onStreakChange }: ActivityGridProps) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [total, setTotal]   = useState(0)

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity")
      if (!res.ok) return
      const data: { counts: Record<string, number>; streak: number; streakStartDate: string | null; streakEndDate: string | null; lastCommitRepo: string | null } = await res.json()
      setCounts(data.counts)
      setTotal(Object.values(data.counts).reduce((a, b) => a + b, 0))
      onStreakChange?.(data.streak, data.streakStartDate, data.streakEndDate, data.lastCommitRepo)
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchActivity() }, [fetchActivity, refreshKey])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weeks = buildGrid(today)
  const monthLabels = getMonthLabels(weeks)
  const dayColW = 28

  return (
    <TooltipProvider delay={100}>
    <div className="rounded-xl border border-border/60 bg-card p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Atividade no GitHub</span>
        </div>
        {counts !== null && (
          <span className="text-xs text-muted-foreground">
            {total} contribuiç{total !== 1 ? "ões" : "ão"} no último ano
          </span>
        )}
      </div>

      {counts === null ? (
        <GridSkeleton />
      ) : (
        <div className="overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          <div
            className="relative select-none"
            style={{ width: dayColW + weeks.length * STEP, height: 16 + 7 * STEP + 24 }}
          >
            {/* Month labels */}
            {monthLabels.map(({ col, label }) => (
              <span
                key={`m-${col}-${label}`}
                className="absolute top-0 text-[10px] text-muted-foreground"
                style={{ left: dayColW + col * STEP }}
              >
                {label}
              </span>
            ))}

            {/* Day-of-week labels (only odd rows) */}
            {DAYS_PT.map((day, row) =>
              row % 2 === 1 ? (
                <span
                  key={day}
                  className="absolute text-[9px] leading-none text-muted-foreground"
                  style={{ top: 16 + row * STEP + 1, left: 0 }}
                >
                  {day}
                </span>
              ) : null
            )}

            {/* Cells */}
            {weeks.map((week, col) =>
              week.map((day, row) => {
                const key    = toKey(day)
                const count  = counts[key] ?? 0
                const future = day > today
                const x = dayColW + col * STEP
                const y = 16 + row * STEP

                if (future) {
                  return (
                    <div
                      key={key}
                      className="absolute rounded-sm bg-transparent"
                      style={{ left: x, top: y, width: CELL, height: CELL }}
                    />
                  )
                }

                const label = count === 0
                  ? "Nenhuma contribuição"
                  : count === 1
                  ? "1 contribuição"
                  : `${count} contribuições`

                return (
                  <Tooltip key={key}>
                    <TooltipTrigger
                      render={
                        <div
                          className={`absolute rounded-sm cursor-default ${cellColor(count)}`}
                          style={{ left: x, top: y, width: CELL, height: CELL }}
                        />
                      }
                    />
                    <TooltipContent side="top">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                )
              })
            )}

            {/* Legend */}
            <div
              className="absolute flex items-center gap-1.5"
              style={{ bottom: 0, right: 0 }}
            >
              <span className="text-[10px] text-muted-foreground">Menos</span>
              {[0, 1, 2, 3, 5].map((n) => (
                <div
                  key={n}
                  className={`rounded-sm ${cellColor(n)}`}
                  style={{ width: CELL, height: CELL }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">Mais</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}

function GridSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3 w-40 mb-2" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-[11px] w-full" />
      ))}
    </div>
  )
}
