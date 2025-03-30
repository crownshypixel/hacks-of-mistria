import { createListCollection } from "@chakra-ui/react"

export const DAYS_IN_A_MONTH = 28
export const NUMBER_OF_SEASONS = 4
export const SECONDS_IN_AN_HOUR = 60 * 60
export const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR
export const SECONDS_IN_A_MONTH = SECONDS_IN_A_DAY * DAYS_IN_A_MONTH
export const SECONDS_IN_A_YEAR = NUMBER_OF_SEASONS * SECONDS_IN_A_MONTH
export const SEASONS = ["spring", "summer", "fall", "winter"] as const
export const REVERSE_SEASONS = { spring: 0, summer: 1, fall: 2, winter: 3 } as const
export type SEASON_IDX = (typeof REVERSE_SEASONS)[keyof typeof REVERSE_SEASONS]

export function translateCalendar(time: number) {
  const year = Math.floor(time / SECONDS_IN_A_YEAR) + 1
  const season = Math.floor((time % SECONDS_IN_A_YEAR) / SECONDS_IN_A_MONTH)
  const day = Math.trunc((time % SECONDS_IN_A_MONTH) / SECONDS_IN_A_DAY) + 1
  return { day, seasonIdx: season, year }
}

export function reverseCalendar({ year, seasonIdx, day }: ReturnType<typeof translateCalendar>) {
  return (year - 1) * SECONDS_IN_A_YEAR + seasonIdx * SECONDS_IN_A_MONTH + (day - 1) * SECONDS_IN_A_DAY
}

export function translateClock(clock: number) {
  let clampedSeconds = Math.max(1, Math.min(clock, 86400)) - 1
  let hours24 = Math.floor(clampedSeconds / 3600)

  // Truncate to nearest 10 minutes
  let minutes = Math.floor((clampedSeconds % 3600) / 60 / 10) * 10

  const period = hours24 < 12 ? "AM" : "PM"

  // for 0 to 12 = 0->12 (easy rule: small % big = small)
  // for 13 to 24 = 13->1
  let hours12 = hours24 % 12 || 12 // Converts 0 -> 12 and 13 -> 1
  if (period === "AM" && hours12 < 6 && hours12 > 2) {
    hours12 = 6
    minutes = 0
  }

  return {
    hour: hours12,
    minutes,
    period
  }
}

export function translatePlaytime(time: number) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor(hours / 60)
  const seconds = Math.floor(time % 60)

  const pad = (num: number) => String(num).padStart(2, "0")

  return `${hours}:${pad(minutes)}:${pad(seconds)}`
}

export const seasonsCollection = createListCollection({
  items: SEASONS.map((season) => ({ label: season, value: REVERSE_SEASONS[season] }))
})

export const daysCollection = createListCollection({
  items: Array(28)
    .fill(0)
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})
