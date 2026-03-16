"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { FolderGit2, GitBranch, Lock, ArrowRight, Loader2, CheckCircle, LogOut } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

interface SetupPageProps {
  username: string
  avatarUrl: string
}

export function SetupPage({ username, avatarUrl }: SetupPageProps) {
  const router = useRouter()
  const [repoName, setRepoName] = useState("commitly")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const VALID_REPO = /^[a-zA-Z0-9_.-]+$/

  const inputError =
    repoName.trim().length === 0
      ? null
      : !VALID_REPO.test(repoName)
        ? "Nome inválido."
        : null

  const canSubmit = repoName.trim().length > 0 && !inputError && !loading && !done

  const handleCreate = async () => {
    if (!canSubmit) return
    setFieldError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/repo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName: repoName.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "REPO_EXISTS") {
          setFieldError(data.error)
        } else {
          toast.error(data.error ?? "Erro ao criar repositório.")
        }
        return
      }

      setDone(true)
      toast.success(`Repositório "${data.repoName}" criado com sucesso!`)

      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch {
      toast.error("Erro de rede. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex py-4 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="size-4 text-primary" />
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

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-border/60 bg-card">
            <FolderGit2 className="size-5 text-muted-foreground" />
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">
            Configure seu repositório
          </h1>
          <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
            Vamos criar um repositório <strong>privado</strong> na sua conta GitHub para
            armazenar seu histórico de commits. Você pode usar o nome padrão ou escolher outro.
          </p>

          {/* Info badge */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            Não se preocupe, só você terá acesso a este repositório.
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Nome do repositório
            </label>
            <div className={`flex items-center rounded-lg border bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring ${inputError || fieldError ? "border-destructive" : "border-input"}`}>
              <span className="mr-1 text-muted-foreground">{username}/</span>
              <input
                type="text"
                value={repoName}
                onChange={(e) => { setRepoName(e.target.value); setFieldError(null) }}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleCreate()}
                placeholder="commitly"
                disabled={loading || done}
                className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
                maxLength={100}
              />
            </div>
            {inputError ? (
              <p className="mt-1.5 text-xs text-destructive">{inputError}</p>
            ) : fieldError ? (
              <p className="mt-1.5 text-xs text-destructive">{fieldError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Apenas letras, números, hifens ( - ), pontos ( . ) e underscores ( _ ).
              </p>
            )}
          </div>

          {/* Button */}
          <Button
            onClick={handleCreate}
            disabled={!canSubmit}
            className="w-full gap-2 h-10"
          >
            {done ? (
              <>
                <CheckCircle className="size-4" />
                Repositório criado!
              </>
            ) : loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando repositório...
              </>
            ) : (
              <>
                Criar repositório
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
