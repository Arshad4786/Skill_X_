import { SCORE_RANGES } from "@/lib/constants"

export function getScoreLabel(score: number): string {
  if (score >= SCORE_RANGES.EXCELLENT.min) return SCORE_RANGES.EXCELLENT.label
  if (score >= SCORE_RANGES.GOOD.min) return SCORE_RANGES.GOOD.label
  if (score >= SCORE_RANGES.AVERAGE.min) return SCORE_RANGES.AVERAGE.label
  return SCORE_RANGES.POOR.label
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_RANGES.EXCELLENT.min) return SCORE_RANGES.EXCELLENT.color
  if (score >= SCORE_RANGES.GOOD.min) return SCORE_RANGES.GOOD.color
  if (score >= SCORE_RANGES.AVERAGE.min) return SCORE_RANGES.AVERAGE.color
  return SCORE_RANGES.POOR.color
}

export function calculateProfileCompletion(profile: {
  name?: string
  email?: string
  phone?: string
  bio?: string
  skills?: string[]
  github?: boolean
  linkedin?: boolean
}): number {
  let completed = 0
  const total = 7

  if (profile.name) completed++
  if (profile.email) completed++
  if (profile.phone) completed++
  if (profile.bio) completed++
  if (profile.skills && profile.skills.length > 0) completed++
  if (profile.github) completed++
  if (profile.linkedin) completed++

  return Math.round((completed / total) * 100)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function getTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(d)
}
