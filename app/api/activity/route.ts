import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { calcStreak } from "@/lib/streak"

const GITHUB_GRAPHQL = "https://api.github.com/graphql"

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

export async function GET() {
  const session = await auth()
  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username: session.user.username },
    }),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch GitHub activity" }, { status: 502 })
  }

  const json = await res.json()
  const weeks: { contributionDays: { date: string; contributionCount: number }[] }[] =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? []

  const counts: Record<string, number> = {}
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        counts[day.date] = day.contributionCount
      }
    }
  }

  const { streak, streakStartDate, streakEndDate } = calcStreak(counts)

  // Last pushed repo from GitHub Events API
  let lastCommitRepo: string | null = null
  try {
    const eventsRes = await fetch(
      `https://api.github.com/users/${session.user.username}/events?per_page=30`,
      { headers: { Authorization: `Bearer ${session.user.accessToken}` }, next: { revalidate: 0 } }
    )
    if (eventsRes.ok) {
      const events: { type: string; repo: { name: string } }[] = await eventsRes.json()
      const push = events.find(e => e.type === "PushEvent")
      if (push) lastCommitRepo = push.repo.name
    }
  } catch { /* silent */ }

  return NextResponse.json({ counts, streak, streakStartDate, streakEndDate, lastCommitRepo })
}
