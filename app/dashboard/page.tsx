import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { DashboardView } from "@/components/dashboard-view"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.githubId) redirect("/")

  await connectDB()
  const user = await User.findOne({ githubId: session.user.githubId })

  if (!user?.repoSetupComplete) redirect("/setup")

  const username = user.username || session.user.username || session.user.name || "user"
  const avatarUrl = user.avatarUrl || session.user.avatarUrl || session.user.image || ""

  return (
    <DashboardView
      username={username}
      avatarUrl={avatarUrl}
    />
  )
}
