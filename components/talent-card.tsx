"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Heart, Send } from "lucide-react"

interface TalentCardProps {
  id: number
  name: string
  skills: string[]
  score: number
  bio: string
  github: boolean
  githubUrl?: string
  linkedin: boolean
  experience?: string
  location?: string
  isFavorite?: boolean
  onFavorite?: (id: number) => void
  onHireRequest?: (id: number) => void
  variant?: "compact" | "full"
}

export function TalentCard({
  id,
  name,
  skills,
  score,
  bio,
  github,
  githubUrl,
  linkedin,
  experience,
  location,
  isFavorite = false,
  onFavorite,
  onHireRequest,
  variant = "full",
}: TalentCardProps) {
  if (variant === "compact") {
    return (
      <Card className="hover:shadow-lg transition-smooth">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{bio}</p>
            </div>
            <div className="text-right ml-2">
              <div className="text-2xl font-bold text-accent">{score}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {skill}
              </span>
            ))}
            {skills.length > 3 && <span className="text-xs text-muted-foreground px-2 py-1">+{skills.length - 3}</span>}
          </div>
          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
            View Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-smooth flex flex-col">
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{name}</h3>
            {location && <p className="text-xs text-muted-foreground mb-1">{location}</p>}
            <p className="text-sm text-muted-foreground">{bio}</p>
          </div>
          {onFavorite && (
            <button onClick={() => onFavorite(id)} className="ml-2 flex-shrink-0">
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-accent">{score}</div>
            <p className="text-xs text-muted-foreground">SkillX Score</p>
          </div>
          {experience && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{experience}</p>
              <p className="text-xs text-muted-foreground">Experience</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {skills.map((skill) => (
            <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {github && githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="w-3 h-3" />
              GitHub
            </a>
          )}
          {linkedin && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Linkedin className="w-3 h-3" />
              LinkedIn
            </div>
          )}
        </div>

        {onHireRequest && (
          <Button onClick={() => onHireRequest(id)} className="w-full bg-primary hover:bg-primary/90 gap-2 mt-auto">
            <Send className="w-4 h-4" />
            Send Hire Request
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
