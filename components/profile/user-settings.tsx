"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, User, Shield, Moon, Sun, AlertCircle, BellOff, Settings as SettingsIcon, Mail, Eye, EyeOff, Smartphone, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserPreferences {
  notifications: {
    email: boolean
    pushNotifications: boolean
    voteActivity: boolean
    commentReplies: boolean
    productUpdates: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: "public" | "private"
    showVotingActivity: boolean
    showReviews: boolean
  }
  accessibility: {
    reduceAnimations: boolean
    highContrastMode: boolean
    largerText: boolean
  }
}

export function UserSettings() {
  const { user, isAuthenticated } = useEnhancedAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [bio, setBio] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState<boolean>(false)
  const [confirmEmail, setConfirmEmail] = useState<string>("")
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      pushNotifications: true,
      voteActivity: true,
      commentReplies: true,
      productUpdates: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: "public",
      showVotingActivity: true,
      showReviews: true
    },
    accessibility: {
      reduceAnimations: false,
      highContrastMode: false,
      largerText: false
    }
  })
  
  // Initialize user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || user.email?.split('@')[0] || '')
      setEmail(user.email || '')
      // Bio would come from user metadata in a real app
      setBio('')
    }
  }, [user])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in')
    }
  }, [isAuthenticated, isLoading, router])
  
  // Save profile changes
  const saveProfileChanges = async () => {
    setIsLoading(true)
    setSaveSuccess(false)
    
    try {
      // In a real app, this would call an API endpoint to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local storage to simulate a real update
      if (user) {
        const updatedUser = {
          ...user,
          name: displayName
        }
        
        localStorage.setItem('authUser', JSON.stringify(updatedUser))
      }
      
      setSaveSuccess(true)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePreferenceChange = (category: keyof UserPreferences, setting: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }
  
  const handleDeleteAccount = async () => {
    if (confirmEmail !== email) {
      toast.error("Email doesn't match", {
        description: "Please enter your email correctly to confirm account deletion."
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // In a real app, we would send a request to delete the account
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      toast.success("Account deleted", {
        description: "Your account has been deleted successfully."
      })
      
      // Simulate sign out after account deletion
      setTimeout(() => {
        localStorage.removeItem('authUser')
        router.push('/')
        router.refresh()
      }, 1500)
    } catch (error) {
      toast.error("Failed to delete account", {
        description: "An error occurred while deleting your account. Please try again."
      })
    } finally {
      setIsLoading(false)
      setDeleteAccountDialogOpen(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>Preferences</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Account</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information visible to other users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed. Contact support for assistance.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-sm text-muted-foreground">
              {saveSuccess && "Changes saved successfully!"}
            </p>
            <Button onClick={saveProfileChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* Preferences Tab */}
      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'email', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications on your device
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'pushNotifications', checked)
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vote-activity">Vote Activity</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when your posts receive votes
                  </p>
                </div>
                <Switch
                  id="vote-activity"
                  checked={preferences.notifications.voteActivity}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'voteActivity', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-replies">Comment Replies</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone replies to your comments
                  </p>
                </div>
                <Switch
                  id="comment-replies"
                  checked={preferences.notifications.commentReplies}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'commentReplies', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-updates">Product Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about updates to products you've voted on
                  </p>
                </div>
                <Switch
                  id="product-updates"
                  checked={preferences.notifications.productUpdates}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'productUpdates', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive a weekly summary of top posts and activities
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={preferences.notifications.weeklyDigest}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'weeklyDigest', checked)
                  }
                />
              </div>
            </div>
          </CardContent>
          
          <CardHeader className="border-t pt-6">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and what others can see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onValueChange={(value) => 
                    handlePreferenceChange('privacy', 'profileVisibility', value)
                  }
                >
                  <SelectTrigger id="profile-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {preferences.privacy.profileVisibility === "public" 
                    ? "Anyone can view your profile"
                    : "Only you can view your profile"}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-voting">Show Voting Activity</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow others to see your votes on products
                  </p>
                </div>
                <Switch
                  id="show-voting"
                  checked={preferences.privacy.showVotingActivity}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('privacy', 'showVotingActivity', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-reviews">Show Reviews</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow others to see reviews you've written
                  </p>
                </div>
                <Switch
                  id="show-reviews"
                  checked={preferences.privacy.showReviews}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('privacy', 'showReviews', checked)
                  }
                />
              </div>
            </div>
          </CardContent>
          
          <CardHeader className="border-t pt-6">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Accessibility
            </CardTitle>
            <CardDescription>
              Customize your experience for better accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-animations">Reduce Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize motion effects throughout the interface
                  </p>
                </div>
                <Switch
                  id="reduce-animations"
                  checked={preferences.accessibility.reduceAnimations}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('accessibility', 'reduceAnimations', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={preferences.accessibility.highContrastMode}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('accessibility', 'highContrastMode', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="larger-text">Larger Text</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase text size throughout the interface
                  </p>
                </div>
                <Switch
                  id="larger-text"
                  checked={preferences.accessibility.largerText}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('accessibility', 'largerText', checked)
                  }
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="justify-between">
            <p className="text-sm text-muted-foreground">
              {saveSuccess && "Preferences saved successfully!"}
            </p>
            <Button onClick={saveProfileChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* Account Tab */}
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage account settings and security options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Change Password</Label>
              <div className="grid gap-2">
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Current password"
                />
                <Input
                  type="password"
                  placeholder="New password"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                />
                <Button className="w-full sm:w-auto" disabled={isLoading}>
                  Update Password
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </AlertDescription>
              </Alert>
              
              <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete your account and remove all your data from our servers.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <p className="text-sm font-medium">
                      To confirm, please enter your email address: <span className="font-bold">{email}</span>
                    </p>
                    <Input
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="ghost" 
                      onClick={() => setDeleteAccountDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isLoading || confirmEmail !== email}
                    >
                      {isLoading ? "Deleting..." : "Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 