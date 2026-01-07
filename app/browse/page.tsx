"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// 1. UPDATED: Added LogOut and CheckCircle2 to the import list
import {
  Search,
  Star,
  Filter,
  Github,
  Linkedin,
  ChevronDown,
  Heart,
  Send,
  LogIn,
  X,
  Loader2,
  AlertCircle,
  LogOut,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea" // For the hire modal

// 2. Import all the new API functions (using a corrected relative path)
import {
  searchTalents,
  getMyFavorites,
  addFavorite,
  removeFavorite,
  sendHireRequest,
  logout,
  getMe,
} from "../../lib/api" // Assuming lib is two levels up from 'browse'

// 3. Define a type for the real talent data
type Talent = {
  _id: string
  userId: {
    name: string
  }
  headline: string
  skills: string[]
  skillxScore: number
  bio: string
  githubUrl: string
  linkedinUrl: string
  experience: string
  location: string
}

// Define a type for the user
type User = {
  _id: string
  userType: "client" | "talent" | "admin"
}

export default function BrowseTalent() {
  // --- State for Data ---
  const [talents, setTalents] = useState<Talent[]>([])
  const [allSkills, setAllSkills] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  // --- State for Search & Filters ---
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0)

  // --- State for UI ---
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showHireModal, setShowHireModal] = useState<Talent | null>(null)

  const router = useRouter()

  // 4. --- Data Fetching Effect ---
  const fetchTalents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const searchParams: any = {
      search: searchTerm,
      page: 1,
      sortBy: "score",
    }
    if (selectedSkill) {
      searchParams.skills = [selectedSkill]
    }

    const result = await searchTalents(searchParams)

    if (result.success) {
      setTalents(result.data.talents)
      const skills = new Set<string>(result.data.talents.flatMap((t: Talent) => t.skills))
      setAllSkills(Array.from(skills))
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }, [searchTerm, selectedSkill])

  // 5. --- Initial Data Load ---
  useEffect(() => {
    const token = localStorage.getItem("skillx_token")
    if (token) {
      const checkUser = async () => {
        const me = await getMe()
        if (me.success) {
          setUser(me.data.user)
          if (me.data.userType === "client") {
            const favResult = await getMyFavorites()
            if (favResult.success) {
              setFavorites(favResult.favorites.map((fav: any) => fav._id))
            }
          }
        } else {
          logout()
        }
      }
      checkUser()
    }
    fetchTalents()
  }, [fetchTalents])

  // 6. --- Filter Logic (Client-side) ---
  const filteredTalents = useMemo(() => {
    return talents.filter((t: Talent) => {
      // Your backend score is 0-100
      return (t.skillxScore || 0) >= minScore
    })
  }, [talents, minScore])

  // 7. --- Event Handlers ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTalents() // Re-fetch from backend with new search term
  }

  const handleToggleFavorite = async (talentId: string) => {
    if (!user || user.userType !== "client") {
      setShowLoginModal(true)
      return
    }

    if (favorites.includes(talentId)) {
      const result = await removeFavorite(talentId)
      if (result.success) {
        setFavorites(favorites.filter(id => id !== talentId))
      }
    } else {
      const result = await addFavorite(talentId)
      if (result.success) {
        setFavorites([...favorites, talentId])
      }
    }
  }

  const handleHireClick = (talent: Talent) => {
    if (!user || user.userType !== "client") {
      setShowLoginModal(true)
    } else {
      setShowHireModal(talent)
    }
  }

  const handleStatClick = () => {
    if (!user || user.userType !== "client") {
      setShowLoginModal(true)
    } else {
      router.push("/client/dashboard") // (Assuming this page will exist)
    }
  }

  // 8. --- Calculate Stats (Client-side) ---
  const avgScore = useMemo(() => {
    if (talents.length === 0) return 0
    const totalScore = talents.reduce((sum, t) => sum + (t.skillxScore || 0), 0)
    return totalScore / talents.length
  }, [talents])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Browse Talent</h1>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link href="/client/login">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <LogIn className="w-4 h-4" />
                  Sign In to Hire
                </Button>
              </Link>
            )}
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
                  <p className="text-sm text-muted-foreground">Avg SkillX Score</p>
                  <p className="text-3xl font-bold text-foreground">{avgScore.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-secondary" onClick={handleStatClick}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Favorites</p>
                  <p className="text-3xl font-bold text-foreground">
                    {user && user.userType === "client" ? favorites.length : 0}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Browse Section */}
        <Card>
          <CardHeader>
            <CardTitle>Find Top Talent</CardTitle>
            <CardDescription>Browse approved talent profiles. Sign in to send hire requests.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, skills, or location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-input border-border flex-1"
                />
                <Button variant="outline" size="icon" type="submit">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 bg-transparent"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {showFilters && (
                <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/30">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Minimum SkillX Score</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100" // Your backend score is 0-100
                        step="1"
                        value={minScore}
                        onChange={e => setMinScore(Number.parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-foreground w-12">{minScore}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Filter by Skill</label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant={selectedSkill === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedSkill(null)
                          // We need to re-fetch when clearing filter
                          // This will now trigger the useEffect
                        }}
                      >
                        All Skills
                      </Button>
                      {allSkills.map(skill => (
                        <Button
                          type="button"
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
            </form>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 flex gap-3 text-sm text-red-900 dark:text-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Talent Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : filteredTalents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No talent found matching your criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTalents.map(talent => (
                  <Card key={talent._id} className="hover:shadow-lg transition-smooth flex flex-col">
                    <CardContent className="pt-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">{talent.userId.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1">{talent.location}</p>
                          <p className="text-sm text-muted-foreground">{talent.bio}</p>
                        </div>
                        <button onClick={() => handleToggleFavorite(talent._id)} className="ml-2 flex-shrink-0">
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              favorites.includes(talent._id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-accent">{talent.skillxScore || 0}</div>
                          <p className="text-xs text-muted-foreground">SkillX Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{talent.experience}</p>
                          <p className="text-xs text-muted-foreground">Experience</p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-4">
                        {talent.skills.map(skill => (
                          <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        {talent.githubUrl && (
                          <a
                            href={talent.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <Github className="w-3 h-3" />
                            GitHub
                          </a>
                        )}
                        {talent.linkedinUrl && (
                          <a
                            href={talent.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>

                      <Button
                        onClick={() => handleHireClick(talent)}
                        className="w-full bg-primary hover:bg-primary/90 gap-2 mt-auto"
                      >
                        <Send className="w-4 h-4" />
                        Send Hire Request
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Sign In to Continue</CardTitle>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">You need to sign in as a recruiter to perform this action.</p>
              <div className="space-y-3">
                <Link href="/client/login" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
                </Link>
                <Link href="/client/signup" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hire Modal */}
      {showHireModal && <HireModal talent={showHireModal} onClose={() => setShowHireModal(null)} />}
    </div>
  )
}

// 9. --- NEW Hire Modal Component ---
// This is the form for sending a hire request
function HireModal({ talent, onClose }: { talent: Talent; onClose: () => void }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    // 10. --- THIS IS THE FIX ---
    // Update the default value to match a potential enum value
    employmentType: "Full-time", 
    salary: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const requestData = {
      ...formData,
      talentId: talent._id,
      salary: { text: formData.salary }, // Match your backend model
    }

    const result = await sendHireRequest(requestData)

    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Hire {talent.userId.name}</CardTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Request Sent!</h3>
              <p className="text-muted-foreground">The admin has been notified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are sending a hire request for{" "}
                <span className="font-semibold text-foreground">{talent.headline || talent.userId.name}</span>.
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                <Input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Employment Type</label>
                {/* 11. --- THIS IS THE FIX ---
                    The <option> values must match your backend enum exactly.
                    I am guessing they are "Full-time", "Part-time", "Contract", "Internship".
                    You may need to adjust these to match your Mongoose model. 
                */}
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full bg-input border border-border rounded-md p-2 text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salary / Rate (e.g., $100k/yr or $75/hr)
                </label>
                <Input name="salary" value={formData.salary} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Description / Message</label>
                <Textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  required
                  className="min-h-24"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 flex gap-3 text-sm text-red-900 dark:text-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Sending..." : "Send Hire Request"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

