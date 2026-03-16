import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Commit } from "@/lib/models/commit"
import { createPrivateRepo } from "@/lib/github"
import { withAuth } from "@/lib/guard"

export const POST = withAuth(async (req: NextRequest, session) => {
  const { repoName } = await req.json()

  if (!repoName || typeof repoName !== "string") {
    return NextResponse.json({ error: "Invalid repository name" }, { status: 400 })
  }

  const sanitized = repoName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, "-")
    .replace(/^[-.]/, "")
    .slice(0, 100)

  if (!sanitized) {
    return NextResponse.json({ error: "Invalid repository name" }, { status: 400 })
  }

  try {
    const repo = await createPrivateRepo(session.user.accessToken, sanitized)

    await connectDB()

    // Clear old commit history so the new repo starts fresh
    await Commit.deleteMany({ githubId: session.user.githubId })

    await User.findOneAndUpdate(
      { githubId: session.user.githubId },
      {
        repoName: repo.name,
        repoId: repo.id,
        repoSetupComplete: true,
        totalCommits: 0,
        dailyCommitsCount: 0,
        lastCommitAt: null,
        dailyResetAt: null,
      }
    )

    return NextResponse.json({ repoName: repo.name, repoUrl: repo.html_url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message.startsWith("REPO_EXISTS:")) {
      const name = message.replace("REPO_EXISTS:", "")
      return NextResponse.json(
        { error: `O repositório "${name}" já existe na sua conta do GitHub. Escolha outro nome.`, code: "REPO_EXISTS" },
        { status: 422 }
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
