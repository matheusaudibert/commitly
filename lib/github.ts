const GITHUB_API = "https://api.github.com"

interface GitHubFile {
  sha: string
  content: string
  encoding: string
}

interface CommitEntry {
  sequence: number
  message: string
  timestamp: string
}

interface ChangesJson {
  repository: string
  owner: string
  totalCommits: number
  history: CommitEntry[]
}

export async function getRepoById(
  accessToken: string,
  repoId: number
): Promise<{ id: number; name: string; html_url: string } | null> {
  const res = await fetch(`${GITHUB_API}/repositories/${repoId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch repository by ID")
  return res.json()
}

export async function createPrivateRepo(
  accessToken: string,
  repoName: string
): Promise<{ id: number; name: string; html_url: string; private: boolean }> {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
      description: "Repositório gerenciado pelo Commitly. Criado com ❤️ por Audibert",
      auto_init: true,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    const alreadyExists =
      res.status === 422 &&
      Array.isArray(error.errors) &&
      error.errors.some(
        (e: { message?: string }) =>
          typeof e.message === "string" && e.message.includes("already exists")
      )

    if (alreadyExists) {
      throw new Error(`REPO_EXISTS:${repoName}`)
    }

    throw new Error(error.message ?? "Failed to create repository")
  }

  const repo = await res.json()

  // Update README with custom Commitly content
  try {
    const readmeRes = await fetch(`${GITHUB_API}/repos/${repo.full_name}/contents/README.md`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    })
    if (readmeRes.ok) {
      ``
      const readmeFile: { sha: string } = await readmeRes.json()
      const content = [
        `# ${repoName}`,
        "",
        "Este repositório é gerenciado pelo [Commitly](https://commitly.audibert.dev), uma ferramenta que registra seus commits de forma automática e organizada.",
        "",
        "## Como funciona",
        "",
        "Cada commit registrado pelo Commitly é salvo no arquivo `changes.json` deste repositório, mantendo um histórico completo das suas atividades.",
        "",
        "> _Considere deixar uma estrela ⭐ no [projeto open source do Commitly](https://github.com/matheusaudibert/commitly) se achar a ferramenta útil!_",
      ].join("\n")

      await fetch(`${GITHUB_API}/repos/${repo.full_name}/contents/README.md`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "chore: init commitly repo",
          content: Buffer.from(content).toString("base64"),
          sha: readmeFile.sha,
        }),
      })
    }
  } catch {
    // Non-critical — repo was created successfully
  }

  return repo
}

export async function getRepoFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string
): Promise<GitHubFile | null> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch file from repository")

  return res.json()
}

export async function commitFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ commit: { sha: string } }> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
  }

  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error("REPO_NOT_FOUND")
    const error = await res.json()
    throw new Error(error.message ?? "Failed to commit file")
  }

  return res.json()
}

export async function pushCommit(
  accessToken: string,
  owner: string,
  repo: string,
  message: string,
  sequence: number
): Promise<string> {
  const filePath = "changes.json"

  const existing = await getRepoFile(accessToken, owner, repo, filePath)

  let currentData: ChangesJson
  let sha: string | undefined

  if (existing) {
    const raw = Buffer.from(existing.content, "base64").toString("utf-8")
    currentData = JSON.parse(raw)
    sha = existing.sha
  } else {
    currentData = {
      repository: repo,
      owner,
      totalCommits: 0,
      history: [],
    }
  }

  const newEntry: CommitEntry = {
    sequence,
    message,
    timestamp: new Date().toISOString(),
  }

  currentData.history.push(newEntry)
  currentData.totalCommits = currentData.history.length

  const result = await commitFile(
    accessToken,
    owner,
    repo,
    filePath,
    JSON.stringify(currentData, null, 2),
    message,
    sha
  )

  return result.commit.sha
}

export async function getRepoStats(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{
  totalCommits: number
  commitsToday: number
  firstCommitAt: string | null
  lastCommitAt: string | null
}> {
  const base = `${GITHUB_API}/repos/${owner}/${repo}/commits`
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  }

  // Most recent commit → last commit date
  const recentRes = await fetch(`${base}?per_page=1`, { headers })
  if (recentRes.status === 404) throw new Error("REPO_NOT_FOUND")
  if (!recentRes.ok) return { totalCommits: 0, commitsToday: 0, firstCommitAt: null, lastCommitAt: null }

  const recent: { commit: { committer: { date: string } } }[] = await recentRes.json()
  if (recent.length === 0) return { totalCommits: 0, commitsToday: 0, firstCommitAt: null, lastCommitAt: null }

  const lastCommitAt = recent[0].commit.committer.date

  // Total commit count via Link header pagination trick
  let totalCommits = 1
  const linkHeader = recentRes.headers.get("link") ?? ""
  const lastPageMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
  if (lastPageMatch) {
    totalCommits = parseInt(lastPageMatch[1], 10)
  }

  // First commit → fetch the last page (page = totalCommits)
  let firstCommitAt: string | null = null
  if (totalCommits > 1) {
    const firstRes = await fetch(`${base}?per_page=1&page=${totalCommits}`, { headers })
    if (firstRes.ok) {
      const first: { commit: { committer: { date: string } } }[] = await firstRes.json()
      firstCommitAt = first[0]?.commit.committer.date ?? null
    }
  } else {
    firstCommitAt = lastCommitAt
  }

  // Commits today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayRes = await fetch(`${base}?since=${todayStart.toISOString()}&per_page=100`, { headers })
  let commitsToday = 0
  if (todayRes.ok) {
    const todayCommits: unknown[] = await todayRes.json()
    commitsToday = todayCommits.length
    // If exactly 100, there might be more — fetch next pages
    if (commitsToday === 100) {
      const todayLink = todayRes.headers.get("link") ?? ""
      const todayLastPage = todayLink.match(/page=(\d+)>;\s*rel="last"/)
      if (todayLastPage) {
        commitsToday = parseInt(todayLastPage[1], 10) * 100
      }
    }
  }

  return { totalCommits, commitsToday, firstCommitAt, lastCommitAt }
}
