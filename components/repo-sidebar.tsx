"use client"

import { ExternalLink, Lock, Calendar, FileJson, Activity, GitCommit } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { StreakCircle } from "@/components/streak-circle"

interface RepoInfo {
  repoName: string
  repoUrl: string
  isPrivate: boolean
  totalCommits: number
  commitsToday: number
  commitlyTotal: number
  firstCommitAt: string | null
  lastCommitAt: string | null
  filePath: string
}

interface StreakInfo {
  days: number
  startDate: string | null
  endDate: string | null
  lastCommitRepo: string | null
}

interface RepoSidebarProps {
  repoInfo: RepoInfo | null
  username: string
  streakInfo: StreakInfo | null
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
}

export function RepoSidebar({ repoInfo, username, streakInfo }: RepoSidebarProps) {
  if (!repoInfo) {
    return (
      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <StreakCircle streakInfo={null} />
      </aside>
    )
  }

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 bg-card p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <GithubIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{repoInfo.repoName}</p>
              <p className="text-xs text-muted-foreground truncate">{username}</p>
            </div>
          </div>
          <a
            href={repoInfo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="cursor-pointer size-3.5" />
          </a>
        </div>

        {/* Private/Public badge */}
        <div className="mb-4 flex items-center gap-1.5">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Lock className="size-2.5" />
            {repoInfo.isPrivate ? "Privado" : "Público"}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2.5 text-xs">
          <Row
            icon={<Activity className="size-3.5" />}
            label="Total de commits"
            value={String(repoInfo.totalCommits)}
            highlight
          />
          <Row
            icon={<GitCommit className="size-3.5" />}
            label="Commits via Commitly"
            value={String(repoInfo.commitlyTotal)}
          />

          <div className="my-1 h-px bg-border/50" />

          <Row
            icon={<Activity className="size-3.5" />}
            label="Commits hoje"
            value={String(repoInfo.commitsToday)}
          />
          <Row
            icon={<FileJson className="size-3.5" />}
            label="Arquivo"
            value={repoInfo.filePath}
            mono
          />

          <div className="my-1 h-px bg-border/50" />

          <Row
            icon={<Calendar className="size-3.5" />}
            label="Primeiro commit"
            value={formatDateTime(repoInfo.firstCommitAt)}
          />
          <Row
            icon={<Calendar className="size-3.5" />}
            label="Último commit"
            value={formatDateTime(repoInfo.lastCommitAt)}
          />
        </div>
      </div>
      <StreakCircle streakInfo={streakInfo} />
    </aside>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function Row({
  icon,
  label,
  value,
  highlight,
  mono,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <span
        className={
          highlight
            ? "font-semibold tabular-nums"
            : mono
              ? "font-mono text-muted-foreground"
              : "text-foreground/80"
        }
      >
        {value}
      </span>
    </div>
  )
}
