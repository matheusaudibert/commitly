"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity } from "lucide-react"
import { calcStreak, todayKey } from "@/lib/streak"

/**
 * O calendário de contribuições do GitHub leva alguns segundos para refletir um
 * commit recém-criado. Depois de commitar, refazemos a busca nesses intervalos
 * até o servidor confirmar o que já está pintado de forma otimista.
 */
const RECONCILE_DELAYS_MS = [1500, 4000, 8000, 15000]

/** Largura preferida da célula. O grid encolhe abaixo disso para caber no container. */
const CELL_MAX = 11
/** Abaixo disso os quadradinhos viram poeira; nesse ponto deixamos rolar. */
const CELL_MIN = 5
const GAP = 3

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
  /**
   * Commits feitos pelo painel hoje que o GitHub pode ainda não estar
   * reportando. São somados ao que veio da API para o feedback ser imediato.
   */
  pendingToday?: number
  onStreakChange?: (streak: number, startDate: string | null, endDate: string | null, lastCommitRepo: string | null) => void
}

export function ActivityGrid({ refreshKey = 0, pendingToday = 0, onStreakChange }: ActivityGridProps) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [lastCommitRepo, setLastCommitRepo] = useState<string | null>(null)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
  const [availWidth, setAvailWidth] = useState(0)

  useEffect(() => {
    if (!scrollEl) return
    const observer = new ResizeObserver(([entry]) => {
      setAvailWidth(entry.contentRect.width)
    })
    observer.observe(scrollEl)
    return () => observer.disconnect()
  }, [scrollEl])

  const fetchActivity = useCallback(async () => {
    try {
      // cache: "no-store" para que um refetch logo após o commit não seja
      // servido da cache do browser com os dados de antes.
      const res = await fetch("/api/activity", { cache: "no-store" })
      if (!res.ok) return
      const data: { counts: Record<string, number>; lastCommitRepo: string | null } = await res.json()
      setCounts(data.counts)
      setLastCommitRepo(data.lastCommitRepo)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchActivity() }, [fetchActivity, refreshKey])

  // Após um commit, o GitHub ainda não devolve a contribuição na hora.
  // Reconsulta em intervalos crescentes até ele alcançar o estado otimista.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timers = RECONCILE_DELAYS_MS.map((delay) =>
      setTimeout(() => { fetchActivity() }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [refreshKey, fetchActivity])

  // Enquanto o GitHub não propaga, projetamos os commits feitos pelo painel.
  // Math.max evita contagem dobrada quando ele finalmente alcança.
  const effectiveCounts = counts && (() => {
    if (pendingToday <= 0) return counts
    const key = todayKey()
    return { ...counts, [key]: Math.max(counts[key] ?? 0, pendingToday) }
  })()

  const total = effectiveCounts
    ? Object.values(effectiveCounts).reduce((a, b) => a + b, 0)
    : 0

  // Recalcula o streak com a mesma regra do servidor (lib/streak), agora
  // considerando o commit otimista — senão ele só subiria no reload.
  useEffect(() => {
    if (!effectiveCounts) return
    const { streak, streakStartDate, streakEndDate } = calcStreak(effectiveCounts)
    onStreakChange?.(streak, streakStartDate, streakEndDate, lastCommitRepo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, pendingToday, lastCommitRepo])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weeks = buildGrid(today)
  const monthLabels = getMonthLabels(weeks)
  const dayColW = 28

  // Dimensiona a célula pelo espaço real do container em vez de fixar 11px,
  // senão as 53 semanas estouram a largura e o container ganha scroll horizontal.
  const step = Math.min(
    CELL_MAX + GAP,
    Math.max(
      CELL_MIN + GAP,
      Math.floor((availWidth - dayColW) / weeks.length)
    )
  )
  const cell = step - GAP
  const gridW = dayColW + weeks.length * step
  const gridH = 16 + 7 * step + 24
  const measured = availWidth > 0

  return (
    <TooltipProvider delay={100}>
    <div className="rounded-xl border border-border/60 bg-card p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Atividade no GitHub</span>
        </div>
        {effectiveCounts != null && (
          <span className="text-xs text-muted-foreground">
            {total} contribuiç{total !== 1 ? "ões" : "ão"} no último ano
          </span>
        )}
      </div>

      {effectiveCounts == null ? (
        <GridSkeleton />
      ) : (
        <div
          ref={setScrollEl}
          className="overflow-x-auto pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="relative select-none"
            style={{ width: gridW, height: gridH, visibility: measured ? "visible" : "hidden" }}
          >
            {/* Month labels */}
            {monthLabels.map(({ col, label }) => (
              <span
                key={`m-${col}-${label}`}
                className="absolute top-0 text-[10px] text-muted-foreground"
                style={{ left: dayColW + col * step }}
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
                  style={{ top: 16 + row * step + 1, left: 0 }}
                >
                  {day}
                </span>
              ) : null
            )}

            {/* Cells */}
            {weeks.map((week, col) =>
              week.map((day, row) => {
                const key    = toKey(day)
                const count  = effectiveCounts[key] ?? 0
                const future = day > today
                const x = dayColW + col * step
                const y = 16 + row * step

                if (future) {
                  return (
                    <div
                      key={key}
                      className="absolute rounded-sm bg-transparent"
                      style={{ left: x, top: y, width: cell, height: cell }}
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
                          style={{ left: x, top: y, width: cell, height: cell }}
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
                  style={{ width: cell, height: cell }}
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
