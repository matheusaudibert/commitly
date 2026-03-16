"use client"

import { useState } from "react"
import { Loader2, SendHorizonal, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommitFormProps {
  onCommit: (message: string) => Promise<void>
  submitting: boolean
  cooldownRemaining: number
  limitReached: boolean
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function CommitForm({ onCommit, submitting, cooldownRemaining, limitReached }: CommitFormProps) {
  const [message, setMessage] = useState("")

  const isBlocked = submitting || cooldownRemaining > 0 || limitReached
  const canSubmit = message.trim().length > 0 && !isBlocked

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSubmit) submit()
    }
  }

  const submit = async () => {
    const msg = message.trim()
    if (!msg) return
    setMessage("")
    await onCommit(msg)
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-medium text-muted-foreground">Novo commit</span>
      </div>

      <div className="p-4">
        {limitReached ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Ban className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Limite diário atingido</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Você fez 20 commits hoje. Volte amanhã para continuar.
              </p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={cooldownRemaining > 0 ? "Aguarde..." : "Descreva o que você fez hoje..."}
              disabled={submitting || cooldownRemaining > 0}
              rows={3}
              maxLength={150}
              className={cn(
                "w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/40",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {cooldownRemaining > 0 && (
                  <span className="text-xs text-amber-400">Cooldown</span>
                )}
                <span className={cn(
                  "text-xs tabular-nums",
                  message.length > 130 ? "text-amber-400" : "text-muted-foreground/50",
                  message.length >= 150 && "text-destructive"
                )}>
                  {message.length}/150
                </span>
              </div>

              <button
                onClick={submit}
                disabled={!canSubmit}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  canSubmit
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                {submitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <SendHorizonal className="size-3" />
                )}
                {submitting ? "Enviando..." : "Commit"}
                {!submitting && (
                  <kbd className="ml-1 rounded bg-primary-foreground/10 px-1 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
