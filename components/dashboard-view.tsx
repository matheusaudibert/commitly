"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { GitBranch, LogOut } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommitForm } from "@/components/commit-form"
import { RepoSidebar } from "@/components/repo-sidebar"
import { CommitStats } from "@/components/commit-stats"
import { ActivityGrid } from "@/components/activity-grid"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

interface CommitStatus {
  dailyCommitsCount: number
  remainingToday: number
  dailyLimit: number
  lastCommitAt: string | null
  cooldownRemaining: number
  cooldownDuration: number
}

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

interface DashboardViewProps {
  username: string
  avatarUrl: string
}

export function DashboardView({ username, avatarUrl }: DashboardViewProps) {
  const router = useRouter()
  const [commitStatus, setCommitStatus] = useState<CommitStatus | null>(null)
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activityKey, setActivityKey] = useState(0)
  const [streakInfo, setStreakInfo] = useState<{ days: number; startDate: string | null; endDate: string | null; lastCommitRepo: string | null } | null>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleRepoDeleted = useCallback(() => {
    toast.error("Repositório não encontrado. Redirecionando para o setup...")
    setTimeout(() => router.push("/setup"), 1500)
  }, [router])

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, repoRes] = await Promise.all([
        fetch("/api/commit"),
        fetch("/api/repo/info"),
      ])
      if (statusRes.ok) setCommitStatus(await statusRes.json())
      if (repoRes.ok) {
        setRepoInfo(await repoRes.json())
      } else {
        const data = await repoRes.json()
        if (data.repoDeleted) handleRepoDeleted()
      }
    } catch {
      // silent
    }
  }, [handleRepoDeleted])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Tick cooldown every second
  useEffect(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)

    if (commitStatus && commitStatus.cooldownRemaining > 0) {
      cooldownRef.current = setInterval(() => {
        setCommitStatus((prev) => {
          if (!prev) return prev
          const next = prev.cooldownRemaining - 1
          if (next <= 0) {
            clearInterval(cooldownRef.current!)
            return { ...prev, cooldownRemaining: 0 }
          }
          return { ...prev, cooldownRemaining: next }
        })
      }, 1000)
    }

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [commitStatus?.cooldownRemaining])

  const handleCommit = async (message: string) => {
    setSubmitting(true)

    try {
      const res = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.repoDeleted) {
          handleRepoDeleted()
        } else if (data.cooldownRemaining) {
          toast.error(`Aguarde ${formatSeconds(data.cooldownRemaining)} para o próximo commit.`)
        } else if (data.limitReached) {
          toast.error("Limite diário de 20 commits atingido. Volte amanhã!")
        } else {
          toast.error(data.error ?? "Erro ao fazer commit.")
        }
        return
      }

      setActivityKey((k) => k + 1)

      const newTotal = (repoInfo?.totalCommits ?? 0) + 1
      toast.success(`Commit #${newTotal} enviado com sucesso!`)

      setCommitStatus((prev) =>
        prev
          ? {
            ...prev,
            dailyCommitsCount: data.dailyCommitsCount,
            remainingToday: data.remainingToday,
            cooldownRemaining: prev.cooldownDuration,
            lastCommitAt: new Date().toISOString(),
          }
          : prev
      )

      setRepoInfo((prev) =>
        prev
          ? {
            ...prev,
            totalCommits: newTotal,
            commitsToday: prev.commitsToday + 1,
            commitlyTotal: prev.commitlyTotal + 1,
            lastCommitAt: new Date().toISOString(),
          }
          : prev
      )
    } catch {
      toast.error("Erro de rede. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background lg:overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="size-4 text-primary " />
            Commitly
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Avatar className="size-6">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{username}</span>
            </a>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:overflow-hidden">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Olá, {username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escreva uma mensagem e pressione Enter para fazer um commit.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Left: stats + form + activity */}
          <div className="flex flex-col gap-4">
            <CommitStats status={commitStatus} />
            <CommitForm
              onCommit={handleCommit}
              submitting={submitting}
              cooldownRemaining={commitStatus?.cooldownRemaining ?? 0}
              limitReached={(commitStatus?.remainingToday ?? 1) <= 0}
            />
            <div className="hidden lg:block">
              <ActivityGrid
                refreshKey={activityKey}
                onStreakChange={(days, startDate, endDate, lastCommitRepo) =>
                  setStreakInfo({ days, startDate, endDate, lastCommitRepo })
                }
              />
            </div>
          </div>

          {/* Right: repo sidebar */}
          <RepoSidebar repoInfo={repoInfo} username={username} streakInfo={streakInfo} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
