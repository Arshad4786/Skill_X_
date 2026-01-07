export const SKILLS = [
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Laravel",
  "Java",
  "Spring Boot",
  "TypeScript",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "GraphQL",
  "AWS",
  "Docker",
  "Kubernetes",
]

export const EXPERIENCE_LEVELS = [
  { label: "Entry Level (0-2 years)", value: "entry" },
  { label: "Mid Level (2-5 years)", value: "mid" },
  { label: "Senior (5-8 years)", value: "senior" },
  { label: "Lead (8+ years)", value: "lead" },
]

export const USER_ROLES = {
  TALENT: "talent",
  CLIENT: "client",
  ADMIN: "admin",
} as const

export const PROFILE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export const HIRE_REQUEST_STATUS = {
  NEW: "new",
  VIEWED: "viewed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const

export const SCORE_RANGES = {
  EXCELLENT: { min: 8.5, max: 10, label: "Excellent", color: "text-green-600" },
  GOOD: { min: 7, max: 8.5, label: "Good", color: "text-blue-600" },
  AVERAGE: { min: 5, max: 7, label: "Average", color: "text-amber-600" },
  POOR: { min: 0, max: 5, label: "Poor", color: "text-red-600" },
}
