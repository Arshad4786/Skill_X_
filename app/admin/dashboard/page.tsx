"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// 1. Corrected imports: Added CheckCircle2, XCircle, Clock, MessageSquare, Eye, Loader2, X, AlertCircle
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  LogOut,
  Search,
  Eye,
  Github,
  Linkedin,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { format } from "date-fns" // Used to format dates

// 2. Import all our correct API functions (using the '@/' alias)
import {
  getAdminStats,
  getPendingTalents,
  getAdminHireRequests,
  approveTalent,
  rejectTalent,
  getAdminHireRequestById,
  logout,
} from "@/lib/api"

// 3. --- Define precise types for our data ---
type AdminStats = {
  pendingTalents: number
  approvedTalents: number
  rejectedTalents: number
  totalHireRequests: number
  pendingHireRequests: number
  adminApproved: number
  adminRejected: number
}

type TalentProfile = {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    createdAt: string
  }
  headline: string
  skills: string[]
  bio: string
  githubUrl: string
  linkedinUrl: string // Added linkedinUrl
  skillxScore: number // Added skillxScore
  status: string
}

type HireRequest = {
  _id: string
  clientId: {
    _id: string
    companyName: string
    userId: {
      email: string
    }
  } | null // Can be null if client was deleted
  talentId: {
    _id: string
    headline: string
    userId?: { name: string } // userId is populated in your backend
  } | null // Can be null if talent was deleted
  jobTitle: string
  status: string
  createdAt: string
  jobDescription?: string // This is in the full request, but good to have
}

// This is the FULL hire request for the modal
type FullHireRequest = HireRequest & {
  jobDescription: string
  employmentType: string
  salary: {
    min: number
    max: number
    rate: string
  }
  location: string
  // Making clientId and talentId non-null for the modal view
  clientId: {
    _id: string
    companyName: string
    userId: {
      email: string
    }
  }
  talentId: {
    _id: string
    headline: string
    userId?: { name: string }
  }
}

// 4. --- Main Component ---
export default function AdminDashboard() {
  // Data state
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingProfiles, setPendingProfiles] = useState<TalentProfile[]>([])
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([])

  // UI State
  const [selectedRequest, setSelectedRequest] = useState<FullHireRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 5. --- Data Fetching ---
  const fetchStats = async () => {
    setIsLoadingStats(true)
    const result = await getAdminStats()
    if (result.success) {
      setStats(result.stats)
    } else {
      setError(result.error)
    }
    setIsLoadingStats(false)
  }

  const fetchPendingProfiles = async () => {
    setIsLoadingProfiles(true)
    const result = await getPendingTalents(searchTerm)
    if (result.success) {
      setPendingProfiles(result.talents)
    } else {
      setError(result.error)
    }
    setIsLoadingProfiles(false)
  }

  const fetchHireRequests = async () => {
    setIsLoadingRequests(true)
    const result = await getAdminHireRequests("") // Get all statuses
    if (result.success) {
      setHireRequests(result.hireRequests)
    } else {
      setError(result.error)
    }
    setIsLoadingRequests(false)
  }

  // Initial data load
  useEffect(() => {
    fetchStats()
    fetchPendingProfiles()
    fetchHireRequests()
  }, [])

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPendingProfiles() // Re-fetch profiles with the new search term
  }

  // 6. --- Action Handlers ---
  const handleApprove = async (talentId: string) => {
    const result = await approveTalent(talentId)
    if (result.success) {
      // Optimistically update UI
      setPendingProfiles((prev) => prev.filter((p) => p._id !== talentId))
      if (stats) {
        setStats({
          ...stats,
          pendingTalents: stats.pendingTalents - 1,
          approvedTalents: stats.approvedTalents + 1,
          adminApproved: stats.adminApproved + 1,
        })
      }
    } else {
      alert(`Approval failed: ${result.error}`)
    }
  }

  const handleReject = async (talentId: string) => {
    const reason = prompt("Please provide a reason for rejection (required):")
    if (!reason) return // User cancelled

    const result = await rejectTalent(talentId, reason)
    if (result.success) {
      // Optimistically update UI
      setPendingProfiles((prev) => prev.filter((p) => p._id !== talentId))
      if (stats) {
        setStats({
          ...stats,
          pendingTalents: stats.pendingTalents - 1,
          rejectedTalents: stats.rejectedTalents + 1,
          adminRejected: stats.adminRejected + 1,
        })
      }
    } else {
      alert(`Rejection failed: ${result.error}`)
    }
  }

  // --- "View" Button Click Handler ---
  const handleViewRequest = async (requestId: string) => {
    const result = await getAdminHireRequestById(requestId)
    if (result.success) {
      setSelectedRequest(result.hireRequest)
      setIsModalOpen(true)
    } else {
      alert(`Failed to fetch details: ${result.error}`)
    }
  }

  // --- "Contact" Button Logic ---
  const getContactEmail = (request: HireRequest): string | null => {
    // We added the email to the 'userId' populate in routes/admin.js
    return request.clientId?.userId?.email || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          {/* 7. Corrected Logout to LogOut */}
          <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {isLoadingStats ? (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {/* Show skeleton loaders for stats */}
            <StatCard icon={Loader2} title="Pending Talent" value="..." color="text-amber-500 animate-spin" />
            <StatCard icon={Loader2} title="Approved" value="..." color="text-green-500 animate-spin" />
            <StatCard icon={Loader2} title="Rejected" value="..." color="text-red-500 animate-spin" />
            <StatCard icon={Loader2} title="Your Approvals" value="..." color="text-blue-500 animate-spin" />
            <StatCard icon={Loader2} title="Your Rejections" value="..." color="text-red-700 animate-spin" />
          </div>
        ) : stats ? (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Clock} title="Pending Talent" value={stats.pendingTalents} color="text-amber-500" />
            <StatCard icon={CheckCircle2} title="Approved" value={stats.approvedTalents} color="text-green-500" />
            <StatCard icon={XCircle} title="Rejected" value={stats.rejectedTalents} color="text-red-500" />
            <StatCard icon={CheckCircle2} title="Your Approvals" value={stats.adminApproved} color="text-blue-500" />
            <StatCard icon={XCircle} title="Your Rejections" value={stats.adminRejected} color="text-red-700" />
          </div>
        ) : null}

        {/* Global Error Display */}
        {error && (
          <Card className="mb-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <CardContent className="p-4 flex gap-3 text-sm text-red-900 dark:text-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">An Error Occurred</p>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Profiles ({isLoadingProfiles ? "..." : pendingProfiles.length})</TabsTrigger>
            <TabsTrigger value="requests">Hire Requests ({isLoadingRequests ? "..." : hireRequests.length})</TabsTrigger>
          </TabsList>

          {/* Pending Profiles Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Profile Reviews</CardTitle>
                <CardDescription>Review and approve new talent profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search by name, email, or headline..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-input border-border"
                  />
                  <Button variant="outline" size="icon" type="submit">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                {isLoadingProfiles ? (
                  <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                ) : pendingProfiles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending profiles found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingProfiles.map((profile) => (
                      <div
                        key={profile._id}
                        className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-smooth"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{profile.userId.name}</h3>
                            <p className="text-sm text-muted-foreground">{profile.userId.email}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {profile.skills.join(", ") || "No Skills"}
                              </span>
                              <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                Score: {profile.skillxScore || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground px-2 py-1">
                                Submitted: {format(new Date(profile.userId.createdAt), "PPP")}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {profile.githubUrl && (
                                <Link href={profile.githubUrl} target="_blank" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                                  <Github className="w-3 h-3" /> GitHub
                                </Link>
                              )}
                              {profile.linkedinUrl && (
                                <Link href={profile.linkedinUrl} target="_blank" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                                  <Linkedin className="w-3 h-3" /> LinkedIn
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(profile._id)
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReject(profile._id)
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hire Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hire Requests</CardTitle>
                <CardDescription>Review and manage hire requests from clients</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                ) : hireRequests.length === 0 ? (
                   <div className="text-center py-8">
                    <p className="text-muted-foreground">No hire requests found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hireRequests.map((request) => {
                      const clientEmail = getContactEmail(request);
                      return (
                        <div
                          key={request._id}
                          className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-smooth"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">{request.clientId ? request.clientId.companyName : "[Deleted Client]"}</h3>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    request.status === "approved"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Requesting: <span className="text-foreground font-medium">{request.talentId ? (request.talentId as any).headline || "[Deleted Talent]" : "[Deleted Talent]"}</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">Position: {request.jobTitle || "N/A"}</p>
                              <p className="text-xs text-muted-foreground mt-1">Date: {format(new Date(request.createdAt), "PPP")}</p>
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                              <Button size="sm" variant="outline" onClick={() => handleViewRequest(request._id)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                asChild // Makes the Button act as a Link
                                disabled={!clientEmail}
                              >
                                <a href={clientEmail ? `mailto:${clientEmail}` : undefined} onClick={(e) => !clientEmail && e.preventDefault()}>
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Contact
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- "VIEW" MODAL --- */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{selectedRequest.jobTitle}</CardTitle>
                <CardDescription>
                  From: {selectedRequest.clientId ? selectedRequest.clientId.companyName : "[Deleted Client]"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Talent</h4>
                <p>{selectedRequest.talentId ? (selectedRequest.talentId as any).headline : "[Deleted Talent]"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Status</h4>
                <p>{selectedRequest.status}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Employment Type</h4>
                <p>{selectedRequest.employmentType}</p>
              </div>
              {selectedRequest.location && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Location</h4>
                  <p>{selectedRequest.location}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Job Description</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.jobDescription}</p>
              </div>
              <Button onClick={() => setIsModalOpen(false)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

// Helper component for stat cards
function StatCard({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: number | string, color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {/* 8. Corrected typo 'classNameclassName' */}
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

