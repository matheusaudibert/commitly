import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Commit } from "@/lib/models/commit"
import { getRepoById, getRepoStats } from "@/lib/github"

export async function GET() {
  const session = await auth()

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ githubId: session.user.githubId })

  if (!user?.repoSetupComplete || !user.repoName) {
    return NextResponse.json({ error: "Repository not setup" }, { status: 404 })
  }

  // Verify repo by ID (handles renames and deletions)
  if (user.repoId) {
    try {
      const repoById = await getRepoById(session.user.accessToken, user.repoId)
      if (!repoById) {
        await User.findOneAndUpdate(
          { githubId: session.user.githubId },
          { repoSetupComplete: false, repoName: null, repoId: null }
        )
        return NextResponse.json({ repoDeleted: true }, { status: 404 })
      }
      if (repoById.name !== user.repoName) {
        await User.findOneAndUpdate(
          { githubId: session.user.githubId },
          { repoName: repoById.name }
        )
        user.repoName = repoById.name
      }
    } catch { /* if lookup fails, proceed with stored name */ }
  }

  // Commitly-tracked commits (via dashboard)
  const commitlyTotal = await Commit.countDocuments({ githubId: session.user.githubId })

  // Commits today (UTC-3)
  const UTC_MINUS_3 = -3 * 60 * 60 * 1000
  const nowUtc3 = new Date(Date.now() + UTC_MINUS_3)
  const todayStartUtc3 = new Date(Date.UTC(
    nowUtc3.getUTCFullYear(),
    nowUtc3.getUTCMonth(),
    nowUtc3.getUTCDate()
  ) - UTC_MINUS_3)

  const commitsToday = await Commit.countDocuments({
    githubId: session.user.githubId,
    createdAt: { $gte: todayStartUtc3 },
  })

  // Real GitHub data (for firstCommitAt / lastCommitAt only)
  let repoStats = {
    firstCommitAt: null as string | null,
    lastCommitAt: null as string | null,
  }

  try {
    const stats = await getRepoStats(session.user.accessToken, session.user.username, user.repoName)
    repoStats.firstCommitAt = stats.firstCommitAt
    repoStats.lastCommitAt = stats.lastCommitAt
  } catch (err) {
    if (err instanceof Error && err.message === "REPO_NOT_FOUND") {
      await User.findOneAndUpdate(
        { githubId: session.user.githubId },
        { repoSetupComplete: false, repoName: null }
      )
      return NextResponse.json({ repoDeleted: true }, { status: 404 })
    }
  }

  return NextResponse.json({
    repoName: user.repoName,
    repoUrl: `https://github.com/${session.user.username}/${user.repoName}`,
    isPrivate: true,
    totalCommits: commitlyTotal,
    commitsToday,
    commitlyTotal,
    firstCommitAt: repoStats.firstCommitAt,
    lastCommitAt: repoStats.lastCommitAt,
    filePath: "changes.json",
  })
}
