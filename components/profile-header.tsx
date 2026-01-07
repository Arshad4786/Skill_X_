"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Settings } from "lucide-react"
import Link from "next/link"

interface ProfileHeaderProps {
  title: string
  backHref: string
  showSettings?: boolean
  settingsHref?: string
  userRole?: "talent" | "client" | "admin"
}

export function ProfileHeader({ title, backHref, showSettings = false, settingsHref, userRole }: ProfileHeaderProps) {
  const getRoleColor = () => {
    switch (userRole) {
      case "talent":
        return "from-blue-500 to-cyan-500"
      case "client":
        return "from-purple-500 to-pink-500"
      case "admin":
        return "from-emerald-500 to-teal-500"
      default:
        return "from-blue-500 to-cyan-500"
    }
  }

  return (
    <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href={backHref} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColor()} rounded-lg`} />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showSettings && settingsHref && (
            <Link href={settingsHref}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
