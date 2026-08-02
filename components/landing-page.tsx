"use client"

import { signIn } from "next-auth/react"
import { buttonVariants } from "@/components/ui/button"
import { AvatarCircles } from "@/components/ui/avatar-circles"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { DotPattern } from "@/components/ui/dot-pattern"
import { LineShadowText } from "@/components/ui/line-shadow-text"
import { SiteHeader } from "@/components/site-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const REPO_URL = "https://github.com/matheusaudibert/commitly"

const AVATARS = Array.from({ length: 6 }, () => ({
  imageUrl: "https://github.com/matheusaudibert.png",
  profileUrl: "https://github.com/matheusaudibert",
}))

export function LandingPage() {
  const handleLogin = () => signIn("github", { callbackUrl: "/" })

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <DotPattern
          id="hero-dots"
          width={28}
          height={28}
          cr={1.1}
          className="text-foreground/25 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_45%,black,transparent)]"
        />
      </div>

      {/* Header */}
      <SiteHeader>
        <ThemeToggle />
      </SiteHeader>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center gap-3">
            <AvatarCircles numPeople={99} avatarUrls={AVATARS} />
            <p className="text-base text-muted-foreground">Junte-se a diversos outros <i>devs</i></p>
          </div>

          <h1 className="mb-5 text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            Mantenha seu streak {" "}
            <LineShadowText className="text-green-500" shadowColor="#16a34a">
              ativo
            </LineShadowText>
          </h1>

          <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Conecte seu GitHub, crie um repositório privado e faça commits reais direto pelo navegador.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <RainbowButton size="lg" onClick={handleLogin} className="h-12 gap-2 px-8 text-base">
              <GithubIcon className="size-5" />
              Começar com GitHub
            </RainbowButton>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 gap-2 px-8 text-base",
                "dark:bg-background dark:hover:bg-muted"
              )}
            >
              Ver repositório
            </a>
          </div>
        </div>
      </main>

      {/* Glass footer */}
      <footer className="bg-transparent px-6 py-6">
        <p className="text-center text-sm text-muted-foreground">
          Projeto open source desenvolvido por{" "}
          <a href="https://github.com/matheusaudibert" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/80 underline underline-offset-2 transition-colors hover:text-foreground">
            Matheus Audibert
          </a>
          .{" "}Acesse o repositório&nbsp;
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-foreground">
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
