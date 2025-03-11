"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserNav } from "@/components/auth/user-nav"
import { Separator } from "@/components/ui/separator"
import { Activity, Settings, User } from "lucide-react"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ActivityList } from "@/components/profile/activity-list"
import { UserSettings } from "@/components/profile/user-settings"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useEnhancedAuth()
  const [activeTab, setActiveTab] = useState<string>("profile")
  
  // If user is not authenticated, redirect to login
  if (!authLoading && !user) {
    router.push("/auth/sign-in")
    return null
  }

  return (
    <div className="container max-w-screen-xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Separator />
        
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
          <aside className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>View and manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <AvatarUpload 
                  currentAvatarUrl={user?.avatar_url}
                  onAvatarUpdated={(url) => {
                    // In a real application, this would update the user profile
                    console.log("Avatar updated:", url)
                  }}
                />
                
                <Separator />
                
                <nav className="grid gap-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      activeTab === "profile" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      activeTab === "activity" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      activeTab === "settings" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </aside>
          
          <div className="flex-1 lg:max-w-3xl">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Profile Overview</CardTitle>
                    <CardDescription>
                      Your public profile information visible to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.email || 'No email address'}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {user?.isAnonymous ? 'Guest User' : 'Registered User'}
                          </span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-1">
                        <h4 className="text-sm font-medium">Join Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="grid gap-1">
                        <h4 className="text-sm font-medium">Activity Stats</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                            <span className="text-xl font-bold">12</span>
                            <span className="text-xs text-muted-foreground">Votes</span>
                          </div>
                          <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                            <span className="text-xl font-bold">5</span>
                            <span className="text-xs text-muted-foreground">Comments</span>
                          </div>
                          <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                            <span className="text-xl font-bold">3</span>
                            <span className="text-xs text-muted-foreground">Reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your most recent actions on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityList />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === "activity" && <ActivityList />}
            
            {activeTab === "settings" && <UserSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}
