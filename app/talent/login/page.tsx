"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Github, Linkedin, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

// 1. Import your login function
import { login, getMyProfile } from "@/lib/api"

export default function TalentLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 2. Create the submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // 3. Call your API's login function
    const result = await login({ email, password })

    if (result.success) {
      // 4. ON SUCCESS: Check if their profile is complete
      const profileResult = await getMyProfile();
      
      if (profileResult.success && (!profileResult.profile.skills || profileResult.profile.skills.length === 0)) {
        // Profile is incomplete, send them to the form
        router.push("/talent/register");
      } else {
        // Profile is complete, send them to the browse page
        router.push("/browse");
      }
    } else {
      // 5. ON FAILURE: Show the error message
      setError(result.error || "An unknown error occurred.")
      setIsLoading(false)
    }
  }

  // 6. Handler for GitHub OAuth
  const handleGithubLogin = () => {
    // Redirects to your backend's OAuth route
    window.location.href = "http://localhost:5000/api/auth/oauth/github"
  }

  // 7. Handler for LinkedIn OAuth
  const handleLinkedInLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/oauth/linkedin"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Talent Login</CardTitle>
          <CardDescription>Access your SkillX profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-input border-border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-input border-border"
                required
              />
            </div>

            {/* Show error message if it exists */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 flex gap-3 text-sm text-red-900 dark:text-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleGithubLogin}>
              <Github className="w-4 h-4" />
              GitHub
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleLinkedInLogin}>
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/talent/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}