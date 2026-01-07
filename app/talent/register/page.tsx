"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Linkedin, ArrowLeft, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react" // Added RefreshCw
import Link from "next/link"

// 1. Import all our correct API functions, including the new one
import {
  updateTalentProfile,
  getMyProfile,
  submitForReview,
  calculateSkillxScore // <-- NEW IMPORT
} from "@/lib/api" // Using your alias path

export default function TalentRegister() {
  const [step, setStep] = useState(1)
  
  // 2. UPDATED STATE: Added 'skillxScore'
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    headline: "",
    bio: "",
    skills: "", // Comma-separated string
    experience: "",
    location: "",
    phoneNumber: "",
    githubUrl: "",
    linkedinUrl: "",
    githubConnected: false,
    linkedinConnected: false,
    skillxScore: 0, // <-- NEW
  })

  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // For saving/submitting
  const [isPageLoading, setIsPageLoading] = useState(true) // For initial load
  const [isCalculating, setIsCalculating] = useState(false) // For score calc
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 3. UPDATED USEEFFECT: This now loads 'connected' status and triggers score calculation
  useEffect(() => {
    const fetchProfile = async () => {
      setIsPageLoading(true);
      const result = await getMyProfile();

      if (result.success && result.profile) {
        const profile = result.profile;
        setFormData({
          name: profile.userId.name || "",
          email: profile.userId.email || "",
          headline: profile.headline || "",
          bio: profile.bio || "",
          skills: (profile.skills || []).join(", "),
          experience: profile.experience || "",
          location: profile.location || "",
          phoneNumber: profile.phoneNumber || "",
          githubUrl: profile.githubUrl || "",
          linkedinUrl: profile.linkedinUrl || "",
          githubConnected: profile.githubConnected || false,
          linkedinConnected: profile.linkedinConnected || false,
          skillxScore: profile.skillxScore || 0, // <-- NEW
        });

        // --- THIS IS THE FIX ---
        // If GitHub is connected, but the score is 0,
        // it means the calculation hasn't run yet. Run it now.
        if (profile.githubConnected && (profile.skillxScore === 0 || !profile.skillxScore)) {
          console.log("GitHub connected, but score is 0. Calculating...");
          // We call this directly, but don't want to block the UI
          // so we don't 'await' it here.
          handleCalculateScore(false); // 'false' means don't show loader
        }
        // -------------------------

      } else {
        console.error(result.error);
        router.push("/talent/login"); // Redirect if we can't get profile
      }
      setIsPageLoading(false);
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Run once on page load

  // This is your original, correct input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  // This is your original, correct connect handler
  // UPDATED: Now saves draft before redirecting
  const handleConnect = (platform: "github" | "linkedin") => {
    // Save draft before redirecting
    handleSaveDraft(false).then(() => {
      const backendUrl = "http://localhost:5000/api/auth/oauth";
      window.location.href = `${backendUrl}/${platform}`;
    });
  }

  // 4. NEW: Function to manually/automatically calculate score
  const handleCalculateScore = async (showLoading = true) => {
    if(showLoading) setIsLoading(true); // Use main loader
    setError(null);
    const result = await calculateSkillxScore();
    if (result.success) {
      setFormData(prev => ({ ...prev, skillxScore: result.score }));
    } else {
      setError(result.error);
    }
    if(showLoading) setIsLoading(false);
  }

  // 5. This function just saves the data (calls PUT /api/talent/profile)
  // UPDATED: Added 'showLoading' parameter
  const handleSaveDraft = async (showLoading = true) => {
    if(showLoading) setIsLoading(true);
    setError(null);
    
    // Prepare data, converting skills to an array
    const profileData = {
      // Send ONLY fields the /talent/profile route expects
      headline: formData.headline,
      bio: formData.bio,
      skills: formData.skills.split(",").map(skill => skill.trim()).filter(Boolean),
      experience: formData.experience,
      location: formData.location,
      phoneNumber: formData.phoneNumber,
      githubUrl: formData.githubUrl,
      linkedinUrl: formData.linkedinUrl,
    };
    
    const result = await updateTalentProfile(profileData);
    if(showLoading) setIsLoading(false);
    
    if (!result.success) {
      setError(result.error);
      return false; // Return failure
    }
    return true; // Return success
  }
  
  // 6. This handles your "Next" buttons, saving as you go
  const handleNextStep = async (nextStep: number) => {
    const success = await handleSaveDraft();
    if (success) {
      setStep(nextStep);
    } else {
      // If saving failed, show error and stay on current step
      setStep(1); // Go to step 1 to show the error
    }
  }

  // 7. This is the FINAL submission handler for Step 3
  const handleSubmitForReview = async () => {
    setIsLoading(true)
    setError(null)

    // First, save all the latest data one last time
    const saveSuccess = await handleSaveDraft(false); // Save, but don't flicker loader

    if (!saveSuccess) {
      // Error is already set by handleSaveDraft
      setIsLoading(false);
      return; // Stop if saving failed
    }

    // Now, call the "submit-for-review" route
    const submitResult = await submitForReview();

    if (submitResult.success) {
      setSubmitted(true)
      setIsLoading(false)
      
      // Redirect to browse page after 3 seconds
      setTimeout(() => {
        router.push("/browse")
      }, 3000)
    } else {
      setError(submitResult.error)
      setIsLoading(false)
    }
  }

  // Page loading spinner
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  // 8. Your full multi-step UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
          <h1 className="text-xl font-bold text-foreground">Complete Your Profile</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {submitted ? (
          <Card className="border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Profile Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your profile is now pending review by our admin team.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Indicator (Your original UI) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-smooth ${
                        s <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-smooth ${s < step ? "bg-primary" : "bg-secondary"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Basic Info</span>
                <span>Integrations</span>
                <span>Review</span>
              </div>
            </div>
            
            {/* Error Message Box (Shows errors on any step) */}
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

            {/* Step 1: Basic Info (Restored your fields) */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input name="email" type="email" value={formData.email} disabled className="bg-secondary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Headline</label>
                    <Input name="headline" value={formData.headline} onChange={handleInputChange} placeholder="e.g., Full Stack Developer @ SkillX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone (for WhatsApp)</label>
                    <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+15550000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                    <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Skills (comma-separated)</label>
                    <Input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="React, Node.js, Python" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                    <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." className="min-h-24" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Experience</label>
                    <Input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g., 5+ years" />
                  </div>
                  <Button
                    onClick={() => handleNextStep(2)}
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isLoading ? "Saving..." : "Save & Continue to Integrations"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Integrations (UPDATED WITH TICKMARK AND SCORE) */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Connect Your Accounts</CardTitle>
                  <CardDescription>Link GitHub and LinkedIn for your SkillX Score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* --- GITHUB BLOCK --- */}
                  <div className="border border-border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-1">GitHub Profile</h3>
                        <p className="text-sm text-muted-foreground">Calculates your SkillX Score.</p>
                      </div>
                      {/* --- SKILLX SCORE DISPLAY --- */}
                      {formData.githubConnected && (
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{formData.skillxScore}</p>
                          <p className="text-xs text-muted-foreground">SkillX Score</p>
                        </div>
                      )}
                    </div>

                    <Input name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/yourusername" />
                    
                    {/* --- UPDATED BUTTON LOGIC --- */}
                    {formData.githubConnected ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">GitHub Connected</span>
                        </div>
                        <Button onClick={() => handleCalculateScore(true)} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Recalculate Score
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => handleConnect("github")} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                        <Github className="w-4 h-4" />
                        Connect GitHub
                      </Button>
                    )}
                  </div>

                  {/* --- LINKEDIN BLOCK --- */}
                  <div className="border border-border rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-medium text-foreground mb-1">LinkedIn Profile</h3>
                    <Input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourprofile" />
                    
                    {formData.linkedinConnected ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">LinkedIn Connected</span>
                      </div>
                    ) : (
                      <Button onClick={() => handleConnect("linkedin")} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                        <Linkedin className="w-4 h-4" />
                        Connect LinkedIn
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1" disabled={isLoading}>
                      Back
                    </Button>
                    <Button onClick={() => handleNextStep(3)} className="flex-1 bg-primary hover:bg-primary/90 gap-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoading ? "Saving..." : "Save & Continue to Review"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review (Your original UI) */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>Make sure everything looks correct before submitting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Review data (This is from your original code) */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-medium mt-1">{formData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Headline</label>
                      <p className="text-foreground font-medium mt-1">{formData.headline || "N/A"}</p>
                    </div>
                     <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground font-medium mt-1">{formData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground font-medium mt-1">{formData.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-foreground font-medium mt-1">{formData.location || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Experience</label>
                      <p className="text-foreground font-medium mt-1">{formData.experience || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Skills</label>
                    <p className="text-foreground mt-1">{formData.skills || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground mt-1">{formData.bio || "N/A"}</p>
                  </div>
                  {/* NEW: Show SkillX Score in review */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SkillX Score</label>
                    <p className="text-foreground font-medium mt-1">{formData.githubConnected ? formData.skillxScore : "GitHub not connected"}</p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900 dark:text-amber-100">
                        <p>Your profile will be reviewed by our admin team and you'll be notified via WhatsApp.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="flex-1" disabled={isLoading}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmitForReview} 
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2" // Changed color to green for "Submit"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

