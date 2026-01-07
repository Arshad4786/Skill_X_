"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Briefcase, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// 1. Import your API functions
import { login, logout } from "@/lib/api"

export default function ClientLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 2. This is the REAL login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent form from reloading the page
    setIsLoading(true)
    setError(null)

    // 3. Call the login function from your api.js
    const result = await login({ email, password })

    if (result.success) {
      // 4. --- CRITICAL SECURITY CHECK ---
      // Check if the logged-in user is a client
      if (result.data.userType === "client") {
        // SUCCESS! Go to the browse page
        router.push("/browse")
      } else {
        // Not a client. Log them out immediately.
        logout()
        setError("This login is for recruiters only.")
        setIsLoading(false)
      }
    } else {
      // 5. Show the error from the backend (e.g., "Invalid email or password")
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Recruiter Login</CardTitle>
          <CardDescription>Find and hire top talent</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 6. Changed to a <form> with onSubmit */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="bg-input border-border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-input border-border"
                required
              />
            </div>
            
            {/* 7. Added error message display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 flex gap-3 text-sm text-red-900 dark:text-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <Button
              type="submit" // 8. Changed to type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            {/* 9. Added link to client signup page */}
            <p className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{" "}
              <Link href="/client/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

