"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

// Note: We don't need getMyProfile here anymore
// import { getMyProfile } from "@/lib/api" 

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const userType = searchParams.get("userType") // Get userType from the URL

    // Check if a token was in the URL
    if (token) {
      // 1. Save the token to the browser's storage
      localStorage.setItem("skillx_token", token)

      // 2. --- THIS IS THE FIX ---
      // We check the userType from the URL, not the profile status.
      // This ensures that clicking "Connect GitHub" from the profile
      // page ALWAYS returns you to the profile page.
      if (userType === "talent") {
        // If it's a talent, ALWAYS send them to the register/profile page.
        router.push("/talent/register")
      } else if (userType === "client") {
        // If it's a client, send them to the browse page.
        router.push("/browse")
      } else {
        // If no type, just go home.
        router.push("/")
      }
      // -------------------------

    } else {
      // No token in URL, something is wrong. Send to login.
      console.error("No token found in callback URL")
      router.push("/talent/login")
    }
  }, [router, searchParams]) // Run this effect when the page loads

  // Show a loading spinner while we process the login
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <p className="ml-4 text-lg">Authenticating, please wait...</p>
    </div>
  )
}

