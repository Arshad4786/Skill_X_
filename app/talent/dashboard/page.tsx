"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Edit2, CheckCircle2, MessageSquare, Github, Linkedin, Eye, Settings } from "lucide-react"
import Link from "next/link"

export default function TalentDashboard() {
  const [profile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    bio: "Full-stack developer with 5+ years experience building scalable web applications",
    score: 8.5,
    status: "approved",
    github: true,
    linkedin: true,
    profileCompletion: 85,
  })

  const [hireRequests] = useState([
    { id: 1, company: "Tech Corp", position: "Senior Developer", salary: "$120k-150k", status: "new" },
    { id: 2, company: "StartUp Inc", position: "Full-stack Engineer", salary: "$100k-130k", status: "viewed" },
    { id: 3, company: "Enterprise Co", position: "Lead Developer", salary: "$150k-180k", status: "new" },
  ])

  const getProfileCompletionColor = (completion: number) => {
    if (completion >= 90) return "text-green-600"
    if (completion >= 70) return "text-blue-600"
    return "text-amber-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Talent Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/talent/settings">
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
        {/* Profile Status */}
        <Card className="mb-8 border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-foreground">Profile Approved</h3>
                  <p className="text-sm text-muted-foreground">Your profile is visible to recruiters</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent">{profile.score}</div>
                <p className="text-xs text-muted-foreground">SkillX Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Profile Completion</h3>
              <span className={`text-sm font-bold ${getProfileCompletionColor(profile.profileCompletion)}`}>
                {profile.profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {profile.profileCompletion < 100
                ? "Complete your profile to increase visibility to recruiters"
                : "Your profile is complete!"}
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-3xl font-bold text-foreground">42</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Skills Listed</p>
                  <p className="text-3xl font-bold text-foreground">{profile.skills.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="requests">Hire Requests</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Manage your professional information</CardDescription>
                </div>
                <Link href="/talent/profile/edit">
                  <Button className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium mt-1">{profile.email}</p>
                  </div>
                </div>

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

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Connected Accounts</h3>
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
          </TabsContent>

          {/* Hire Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Hire Requests</CardTitle>
                <CardDescription>Companies interested in hiring you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hireRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-smooth"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{request.company}</h3>
                          <p className="text-sm text-muted-foreground">{request.position}</p>
                          <p className="text-sm font-medium text-accent mt-2">{request.salary}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "new" && (
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              New
                            </span>
                          )}
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            View Details
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
