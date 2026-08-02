/**
 * Cálculo de streak compartilhado entre a API (/api/activity) e o cliente.
 *
 * O cliente precisa da mesma regra porque o calendário de contribuições do
 * GitHub demora a refletir um commit recém-feito: até ele propagar, o painel
 * projeta o resultado localmente somando os commits pendentes de hoje.
 *
 * Todas as datas usam UTC-3 (horário de Brasília), que é o fuso em que o dia
 * "hoje" é definido para o usuário.
 */

const UTC3_OFFSET_MS = 3 * 60 * 60 * 1000

export interface StreakResult {
  streak: number
  streakStartDate: string | null
  streakEndDate: string | null
}

export type ContributionCounts = Record<string, number>

function dateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

function prevDay(d: Date): Date {
  const p = new Date(d)
  p.setUTCDate(p.getUTCDate() - 1)
  return p
}

/** Chave `YYYY-MM-DD` do dia de hoje em UTC-3. */
export function todayKey(now: number = Date.now()): string {
  return dateStr(new Date(now - UTC3_OFFSET_MS))
}

export function calcStreak(
  counts: ContributionCounts,
  now: number = Date.now()
): StreakResult {
  const utc3 = new Date(now - UTC3_OFFSET_MS)

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
