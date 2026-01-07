"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Briefcase, Shield, Github, Linkedin, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const roles = [
    {
      id: "talent",
      title: "Talent",
      description: "Showcase your skills and connect with top companies",
      icon: Users,
      href: "/talent/register",
      color: "from-blue-500 to-cyan-500",
      features: ["GitHub Integration", "SkillX Score", "Profile Approval"],
    },
    {
      id: "client",
      title: "Recruiter",
      description: "Find and hire the best talent for your team",
      icon: Briefcase,
      href: "/client/login",
      color: "from-purple-500 to-pink-500",
      features: ["Advanced Search", "Hire Requests", "Talent Profiles"],
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage platform quality and approvals",
      icon: Shield,
      href: "/admin/login",
      color: "from-emerald-500 to-teal-500",
      features: ["Profile Review", "Hire Requests", "Notifications"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SkillX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/client/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/talent/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Connect Talent with Opportunity
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            SkillX is a curated talent marketplace powered by GitHub and LinkedIn integration. Every profile is
            verified, every opportunity is real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/talent/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Join as Talent <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Browse Talent <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Card
                key={role.id}
                className="transition-smooth hover:shadow-lg hover:border-accent/50 cursor-pointer"
                onMouseEnter={() => setHoveredCard(role.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={role.href} className="block">
                    <Button
                      className="w-full transition-smooth"
                      variant={hoveredCard === role.id ? "default" : "outline"}
                    >
                      {role.title === "Admin" ? "Admin Portal" : `Enter as ${role.title}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="bg-card border border-border rounded-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why SkillX?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Github className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">GitHub Integration</h3>
                <p className="text-muted-foreground">
                  Automatic SkillX Score calculation based on real coding activity and contributions
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Linkedin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">LinkedIn Verification</h3>
                <p className="text-muted-foreground">
                  Professional profiles verified through LinkedIn for authenticity
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Quality Assured</h3>
                <p className="text-muted-foreground">Every talent profile is reviewed and approved by our admin team</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Real-Time Notifications</h3>
                <p className="text-muted-foreground">
                  Instant WhatsApp notifications for new opportunities and approvals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
