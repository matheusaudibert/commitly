import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LandingPage } from "@/components/landing-page"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    if (!session.user.repoSetupComplete) {
      redirect("/setup")
    } else {
      redirect("/dashboard")
    }
  }

  return <LandingPage />
}
