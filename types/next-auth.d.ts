import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      githubId: string
      username: string
      accessToken: string
      avatarUrl: string
      repoSetupComplete: boolean
    }
  }
}
