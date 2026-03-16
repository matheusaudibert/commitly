import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Commit } from "@/lib/models/commit"
import { pushCommit } from "@/lib/github"
import { withAuth } from "@/lib/guard"

const DAILY_LIMIT = 20
const COOLDOWN_MS = 3 * 60 * 1000
const UTC_MINUS_3  = -3 * 60 * 60 * 1000

function toUTC3(d: Date): Date {
  return new Date(d.getTime() + UTC_MINUS_3)
}

function isSameUTC3Day(a: Date, b: Date): boolean {
  const la = toUTC3(a)
  const lb = toUTC3(b)
  return (
    la.getUTCFullYear() === lb.getUTCFullYear() &&
    la.getUTCMonth()    === lb.getUTCMonth()    &&
    la.getUTCDate()     === lb.getUTCDate()
  )
}

export const POST = withAuth(async (req: NextRequest, session) => {
  const { message } = await req.json()

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Mensagem obrigatória." }, { status: 400 })
  }

  if (message.trim().length > 150) {
    return NextResponse.json({ error: "Mensagem muito longa (máx. 150 caracteres)." }, { status: 400 })
  }

  await connectDB()

  const user = await User.findOne({ githubId: session.user.githubId })

  if (!user?.repoSetupComplete || !user.repoName) {
    return NextResponse.json({ error: "Repositório não configurado." }, { status: 400 })
  }

  const now = new Date()

  if (user.dailyResetAt && !isSameUTC3Day(user.dailyResetAt, now)) {
    user.dailyCommitsCount = 0
  }

  if (user.dailyCommitsCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Limite diário atingido.", limitReached: true, dailyLimit: DAILY_LIMIT },
      { status: 429 }
    )
  }

  if (user.lastCommitAt) {
    const elapsed = now.getTime() - new Date(user.lastCommitAt).getTime()
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
      return NextResponse.json(
        { error: "Cooldown ativo.", cooldownRemaining: remaining },
        { status: 429 }
      )
    }
  }

  try {
    const sequence = user.totalCommits + 1
    const commitSha = await pushCommit(
      session.user.accessToken,
      session.user.username,
      user.repoName,
      message.trim(),
      sequence
    )

    const newDailyCount = user.dailyCommitsCount + 1
    const newTotal      = user.totalCommits + 1

    await User.findOneAndUpdate(
      { githubId: session.user.githubId },
      { totalCommits: newTotal, dailyCommitsCount: newDailyCount, lastCommitAt: now, dailyResetAt: now }
    )

    await Commit.create({
      userId:    user._id,
      githubId:  session.user.githubId,
      message:   message.trim(),
      commitSha,
      sequence,
    })

    return NextResponse.json({
      success: true,
      commitSha,
      sequence,
      dailyCommitsCount: newDailyCount,
      remainingToday:    DAILY_LIMIT - newDailyCount,
    })
  } catch (err) {
    if (err instanceof Error && err.message === "REPO_NOT_FOUND") {
      await User.findOneAndUpdate(
        { githubId: session.user.githubId },
        { repoSetupComplete: false, repoName: null }
      )
      return NextResponse.json({ repoDeleted: true }, { status: 404 })
    }
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
})

export async function GET() {
  const session = await auth()

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ githubId: session.user.githubId })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const now      = new Date()
  const isNewDay = user.dailyResetAt ? !isSameUTC3Day(user.dailyResetAt, now) : true
  const dailyCount = isNewDay ? 0 : user.dailyCommitsCount

  let cooldownRemaining = 0
  if (user.lastCommitAt && !isNewDay) {
    const elapsed = now.getTime() - new Date(user.lastCommitAt).getTime()
    if (elapsed < COOLDOWN_MS) {
      cooldownRemaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
    }
  }

  return NextResponse.json({
    dailyCommitsCount: dailyCount,
    remainingToday:    DAILY_LIMIT - dailyCount,
    dailyLimit:        DAILY_LIMIT,
    lastCommitAt:      user.lastCommitAt,
    cooldownRemaining,
    cooldownDuration:  COOLDOWN_MS / 1000,
  })
}
