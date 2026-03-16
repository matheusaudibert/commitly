"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-foreground">
      <p className="mb-2 font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Essa página não existe ou foi removida.
      </p>
      <Link href="/" className={buttonVariants()}>
        Voltar para o início
      </Link>
    </main>
  )
}
