"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatItem {
  label: string
  value: string | number
  icon: LucideIcon
  color: "blue" | "green" | "amber" | "red" | "purple" | "yellow"
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}

const colorMap = {
  blue: "text-blue-500",
  green: "text-green-500",
  amber: "text-amber-500",
  red: "text-red-500",
  purple: "text-purple-500",
  yellow: "text-yellow-500",
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }

  return (
    <div className={`grid ${gridClass[columns]} gap-4`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${colorMap[stat.color]}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
