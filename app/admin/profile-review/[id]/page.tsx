"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2, Github, Linkedin, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ProfileReview() {
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const profile = {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    bio: "Full-stack developer with 5+ years experience building scalable web applications",
    score: 8.5,
    github: true,
    linkedin: true,
    submittedDate: "2024-01-15",
    profileCompletion: 85,
  }

  const handleApprove = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/admin/dashboard")
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-foreground">Profile Review</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>Submitted on {profile.submittedDate}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground mt-1">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground mt-1">{profile.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-foreground mt-1">{profile.location}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground">Professional Information</h3>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground mt-1">{profile.bio}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">Skills</label>
                    <div className="flex gap-2 flex-wrap">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-foreground" />
                        <div>
                          <p className="font-medium text-foreground">GitHub</p>
                          <p className="text-sm text-muted-foreground">Connected</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-foreground">LinkedIn</p>
                          <p className="text-sm text-muted-foreground">Connected</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">SkillX Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">{profile.score}</div>
                <p className="text-sm text-muted-foreground mb-4">Out of 10</p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(profile.score / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">{profile.profileCompletion}%</div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${profile.profileCompletion}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleApprove} className="w-full bg-green-600 hover:bg-green-700 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Profile
                </Button>
                <Button
                  onClick={() => setShowRejectionForm(!showRejectionForm)}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Reject Profile
                </Button>
              </CardContent>
            </Card>

            {/* Rejection Form */}
            {showRejectionForm && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Explain why this profile is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-input border-border min-h-24"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setShowRejectionForm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="flex-1">
                      Confirm Rejection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Talent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Talent</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
