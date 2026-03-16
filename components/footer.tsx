export function Footer() {
  return (
    <footer className="border-t border-border/40 px-6 py-6">
      <p className="text-center text-xs text-muted-foreground">
        Projeto open source desenvolvido por{" "}
        <a href="https://github.com/matheusaudibert" target="_blank" rel="noopener noreferrer" className="text-foreground/80 font-medium underline underline-offset-2 hover:text-foreground transition-colors">
          Matheus Audibert
        </a>
        .{" "} Acesse o repositório&nbsp;
        <a
          href="https://github.com/matheusaudibert/commitly"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          aqui
        </a>
        &nbsp;e considere deixar uma estrela ⭐
      </p>
    </footer>
  )
}
