import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as unknown as {
          id: number
          login: string
          email: string
          avatar_url: string
        }

        token.githubId = String(githubProfile.id)
        token.username = githubProfile.login
        token.accessToken = account.access_token!
        token.avatarUrl = githubProfile.avatar_url

        await connectDB()

        const existing = await User.findOne({ githubId: token.githubId })

        if (!existing) {
          await User.create({
            githubId: token.githubId,
            username: githubProfile.login,
            email: githubProfile.email ?? "",
            accessToken: account.access_token!,
            avatarUrl: githubProfile.avatar_url,
          })
          token.repoSetupComplete = false
        } else {
          await User.findOneAndUpdate(
            { githubId: token.githubId },
            { accessToken: account.access_token!, avatarUrl: githubProfile.avatar_url }
          )
          token.repoSetupComplete = existing.repoSetupComplete
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user.githubId = token.githubId as string
      session.user.username = token.username as string
      session.user.accessToken = token.accessToken as string
      session.user.avatarUrl = token.avatarUrl as string
      session.user.repoSetupComplete = token.repoSetupComplete as boolean
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
