"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LogOut,
  Search,
  Star,
  MessageSquare,
  Filter,
  Github,
  Linkedin,
  ChevronDown,
  Heart,
  Send,
  Settings,
} from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const talents = [
    {
      id: 1,
      name: "Alex Johnson",
      skills: ["React", "Node.js", "TypeScript"],
      score: 8.5,
      bio: "Full-stack developer with 5+ years experience",
      github: true,
      linkedin: true,
      experience: "5+ years",
      location: "San Francisco, CA",
    },
    {
      id: 2,
      name: "Sarah Chen",
      skills: ["Python", "Django", "PostgreSQL"],
      score: 9.2,
      bio: "Backend specialist, passionate about scalable systems",
      github: true,
      linkedin: true,
      experience: "7+ years",
      location: "New York, NY",
    },
    {
      id: 3,
      name: "Mike Davis",
      skills: ["Vue.js", "Laravel", "MySQL"],
      score: 7.8,
      bio: "Full-stack developer with startup experience",
      github: true,
      linkedin: false,
      experience: "4+ years",
      location: "Austin, TX",
    },
    {
      id: 4,
      name: "Emma Wilson",
      skills: ["React", "GraphQL", "AWS"],
      score: 8.9,
      bio: "Frontend expert with cloud infrastructure knowledge",
      github: true,
      linkedin: true,
      experience: "6+ years",
      location: "Seattle, WA",
    },
    {
      id: 5,
      name: "James Brown",
      skills: ["Java", "Spring Boot", "Kubernetes"],
      score: 8.7,
      bio: "Enterprise backend developer with DevOps expertise",
      github: true,
      linkedin: true,
      experience: "8+ years",
      location: "Boston, MA",
    },
  ]

  const [hireRequests, setHireRequests] = useState([
    { id: 1, talent: "Alex Johnson", position: "Senior Developer", status: "pending", date: "2 days ago" },
    { id: 2, talent: "Sarah Chen", position: "ML Engineer", status: "accepted", date: "1 week ago" },
  ])

  const allSkills = Array.from(new Set(talents.flatMap((t) => t.skills)))

  const filteredTalents = talents.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = !selectedSkill || t.skills.includes(selectedSkill)
    const matchesScore = t.score >= minScore
    return matchesSearch && matchesSkill && matchesScore
  })

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleSendRequest = (talentId: number) => {
    alert(`Hire request sent to talent ${talentId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Recruiter Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/client/settings">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Talent</p>
                  <p className="text-3xl font-bold text-foreground">{talents.length}</p>
                </div>
                <Star className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hire Requests</p>
                  <p className="text-3xl font-bold text-foreground">{hireRequests.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg SkillX Score</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(talents.reduce((sum, t) => sum + t.score, 0) / talents.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Talent</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          {/* Browse Talent Tab */}
          <TabsContent value="browse" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find Top Talent</CardTitle>
                <CardDescription>Search and filter by skills, experience, and SkillX Score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name, skills, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-input border-border flex-1"
                    />
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 bg-transparent"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/30">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Minimum SkillX Score</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={minScore}
                            onChange={(e) => setMinScore(Number.parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-foreground w-12">{minScore.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Filter by Skill</label>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant={selectedSkill === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSkill(null)}
                          >
                            All Skills
                          </Button>
                          {allSkills.map((skill) => (
                            <Button
                              key={skill}
                              variant={selectedSkill === skill ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSkill(skill)}
                            >
                              {skill}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Talent Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTalents.map((talent) => (
                    <Card key={talent.id} className="hover:shadow-lg transition-smooth flex flex-col">
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{talent.name}</h3>
                            <p className="text-xs text-muted-foreground mb-1">{talent.location}</p>
                            <p className="text-sm text-muted-foreground">{talent.bio}</p>
                          </div>
                          <button onClick={() => toggleFavorite(talent.id)} className="ml-2 flex-shrink-0">
                            <Heart
                              className={`w-5 h-5 transition-colors ${
                                favorites.includes(talent.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-accent">{talent.score}</div>
                            <p className="text-xs text-muted-foreground">SkillX Score</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{talent.experience}</p>
                            <p className="text-xs text-muted-foreground">Experience</p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap mb-4">
                          {talent.skills.map((skill) => (
                            <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                          {talent.github && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Github className="w-3 h-3" />
                              GitHub
                            </div>
                          )}
                          {talent.linkedin && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Linkedin className="w-3 h-3" />
                              LinkedIn
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleSendRequest(talent.id)}
                          className="w-full bg-primary hover:bg-primary/90 gap-2 mt-auto"
                        >
                          <Send className="w-4 h-4" />
                          Send Hire Request
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTalents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No talent found matching your criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Hire Requests</CardTitle>
                <CardDescription>Track your sent hire requests and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hireRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-smooth"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{request.talent}</h3>
                          <p className="text-sm text-muted-foreground">Position: {request.position}</p>
                          <p className="text-xs text-muted-foreground mt-1">Sent {request.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              request.status === "accepted"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {request.status === "accepted" ? "Accepted" : "Pending"}
                          </span>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
