"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
  /** Conteúdo do lado direito (ações, toggle de tema, etc.) */
  children?: ReactNode
  /** Use `fixed` quando o conteúdo abaixo já for centralizado na tela inteira. */
  position?: "sticky" | "fixed"
  /** Quando definido, a marca vira um link. */
  brandHref?: string
  className?: string
}

export function SiteHeader({
  children,
  position = "sticky",
  brandHref,
  className,
}: SiteHeaderProps) {
  const brandContent = (
    <>
      <Image
        src="/logo.png"
        alt="Commitly"
        width={26}
        height={26}
        className="invert-0 dark:invert"
      />
      Commitly
    </>
  )

  const brandClassName = "flex items-center gap-2.5 text-lg font-semibold tracking-tight"

  return (
    <header
      className={cn(
        "z-40 bg-transparent",
        position === "fixed" ? "fixed top-0 right-0 left-0" : "sticky top-0",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        {brandHref ? (
          <Link
            href={brandHref}
            className={cn(brandClassName, "transition-opacity hover:opacity-80")}
          >
            {brandContent}
          </Link>
        ) : (
          <div className={brandClassName}>{brandContent}</div>
        )}

        {children ? (
          <div className="flex items-center gap-3">{children}</div>
        ) : null}
      </div>
    </header>
  )
}
