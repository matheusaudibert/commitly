import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { SetupPage } from "@/components/setup-page"

export default async function Setup() {
  const session = await auth()
  if (!session?.user?.githubId) redirect("/")

  await connectDB()
  const user = await User.findOne({ githubId: session.user.githubId })

  if (user?.repoSetupComplete) redirect("/dashboard")

  return (
    <SetupPage
      username={user?.username ?? session.user.username}
      avatarUrl={user?.avatarUrl ?? session.user.avatarUrl}
    />
  )
}
