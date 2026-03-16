import { NextResponse } from "next/server"
import { auth } from "@/auth"

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

interface StreakResult {
  streak: number
  streakStartDate: string | null
  streakEndDate: string | null
}

function calcStreak(counts: Record<string, number>): StreakResult {
  const utc3 = new Date(Date.now() - 3 * 60 * 60 * 1000)

  function dateStr(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
  }

  function prevDay(d: Date): Date {
    const p = new Date(d)
    p.setUTCDate(p.getUTCDate() - 1)
    return p
  }

  const todayStr = dateStr(utc3)
  const yesterdayStr = dateStr(prevDay(utc3))

  let endDate: Date
  if ((counts[todayStr] ?? 0) > 0) {
    endDate = utc3
  } else if ((counts[yesterdayStr] ?? 0) > 0) {
    endDate = prevDay(utc3)
  } else {
    return { streak: 0, streakStartDate: null, streakEndDate: null }
  }

  const streakEndDate = dateStr(endDate)
  let streak = 0
  let current = endDate

  while ((counts[dateStr(current)] ?? 0) > 0) {
    streak++
    current = prevDay(current)
  }

  // current is now the day before streak started; add one day back
  const streakFirstDay = new Date(current)
  streakFirstDay.setUTCDate(streakFirstDay.getUTCDate() + 1)

  return { streak, streakStartDate: dateStr(streakFirstDay), streakEndDate }
}

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
