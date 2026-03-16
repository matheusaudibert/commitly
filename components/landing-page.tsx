"use client"

import { signIn } from "next-auth/react"
import { GitBranch, Lock, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingPage() {
  const handleLogin = () => signIn("github", { callbackUrl: "/" })

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex py-4 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="size-4 text-primary" />
            Commitly
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button size="sm" onClick={handleLogin} className="gap-2 hover:bg-primary/90 dark:hover:bg-primary/90">
              <GithubIcon className="size-4" />
              Entrar com GitHub
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-5 flex flex-col items-center gap-2">
            <AvatarGroup>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/Gildaciolopes.png" alt="@gildaciolopes" />
                <AvatarFallback>GL</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/guithepc.png" alt="@guithepc" />
                <AvatarFallback>GP</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/caio-andres.png" alt="@caio-andres" />
                <AvatarFallback>CA</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/kalellz.png" alt="@kalellz" />
                <AvatarFallback>KZ</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+99</AvatarGroupCount>
            </AvatarGroup>
            <p className="text-sm text-muted-foreground">Junte-se a diversos outros <i>devs</i></p>
          </div>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Mantenha seu streak {" "}
            <span className="text-green-500"><i>ativo</i></span>
          </h1>

          <p className="mb-8 max-w-md text-base text-muted-foreground leading-relaxed">
            Conecte seu GitHub, crie um repositório privado e faça commits reais direto pelo navegador.
          </p>

          <Button size="lg" onClick={handleLogin} className="mb-3 h-11 gap-2 px-8 hover:bg-primary/90 dark:hover:bg-primary/90">
            <GithubIcon className="size-4" />
            Começar com GitHub
          </Button>
        </div>
      </main>

      {/* Glass footer */}
      <footer className="border-t border-border/40 px-6 py-6">
        <p className="text-center text-xs text-muted-foreground">
          Projeto open source desenvolvido por{" "}
          <a href="https://github.com/matheusaudibert" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/80 underline underline-offset-2 transition-colors hover:text-foreground">
            Matheus Audibert
          </a>
          .{" "}Acesse o repositório&nbsp;
          <a href="https://github.com/matheusaudibert/commitly" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-foreground">
            aqui
          </a>
          &nbsp;e considere deixar uma estrela ⭐
        </p>
      </footer>
    </div>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
