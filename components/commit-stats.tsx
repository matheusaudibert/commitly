"use client"

import { Zap, Calendar, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CommitStatus {
  dailyCommitsCount: number
  remainingToday: number
  dailyLimit: number
  lastCommitAt: string | null
  cooldownRemaining: number
  cooldownDuration: number
}

interface CommitStatsProps {
  status: CommitStatus | null
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  highlight?: "green" | "amber" | "red"
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:gap-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div>
        <div
          className={cn(
            "text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
            highlight === "green" && "text-emerald-400",
            highlight === "amber" && "text-amber-400",
            highlight === "red" && "text-red-400"
          )}
        >
          {value}
        </div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}

export function CommitStats({ status }: CommitStatsProps) {
  if (!status) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    )
  }

  const progressPct = Math.round((status.dailyCommitsCount / status.dailyLimit) * 100)
  const remaining = status.remainingToday

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Zap className="size-3.5" />}
          label="Commits hoje"
          value={status.dailyCommitsCount}
          sub={`de ${status.dailyLimit}`}
          highlight={status.dailyCommitsCount >= status.dailyLimit ? "red" : "green"}
        />
        <StatCard
          icon={<Calendar className="size-3.5" />}
          label="Restantes"
          value={remaining}
          sub="neste dia"
          highlight={remaining === 0 ? "red" : remaining <= 5 ? "amber" : undefined}
        />
        <StatCard
          icon={<Clock className="size-3.5" />}
          label="Cooldown"
          value={status.cooldownRemaining > 0 ? formatSeconds(status.cooldownRemaining) : "—"}
          sub={status.cooldownRemaining > 0 ? "aguardando" : "livre"}
          highlight={status.cooldownRemaining > 0 ? "amber" : "green"}
        />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progresso diário</span>
          <span className="tabular-nums text-muted-foreground">
            {status.dailyCommitsCount}/{status.dailyLimit}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressPct >= 100 ? "bg-red-500" : progressPct >= 75 ? "bg-amber-500" : "bg-emerald-500"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
