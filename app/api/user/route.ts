import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"

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

  return NextResponse.json({
    githubId: user.githubId,
    username: user.username,
    avatarUrl: user.avatarUrl,
    repoName: user.repoName,
    repoSetupComplete: user.repoSetupComplete,
    totalCommits: user.totalCommits,
    createdAt: user.createdAt,
  })
}
