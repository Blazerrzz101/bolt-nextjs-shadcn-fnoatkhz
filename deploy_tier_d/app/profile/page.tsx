"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"
import { ThumbsUp, ThumbsDown, MessageSquare, Tag, ArrowBigUp, ArrowBigDown, Camera, Calendar, RefreshCw, User, Settings, FileImage, CalendarDays, Vote, MoreHorizontal, Filter, Clock, BellRing, ArrowRight, PenSquare, BellOff, Activity, Settings2, Share } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Particles } from "@/components/ui/particles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { User2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileClientWrapper } from "./client-wrapper"

interface Activity {
  id: string
  type: "vote" | "comment" | "review" | "profile"
  action: "upvote" | "downvote" | "comment" | "review" | "update"
  productId: string
  productName: string
  timestamp: string
  details?: string
}

function ProfilePageContent() {
  const router = useRouter()
  const { user, isLoading } = useEnhancedAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [activeTab, setActiveTab] = useState<string>("activities")
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [isFetchingActivities, setIsFetchingActivities] = useState(true)
  const profileRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  // Mock state for realtime updates demo
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)

  console.log("🧑‍💻 [ProfilePage] Initial render with auth state:", { 
    isLoading, 
    user: user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      isAnonymous: user.isAnonymous
    } : "No user" 
  })

  // Add debugging log for authentication state
  useEffect(() => {
    console.log("ProfilePageContent: Authentication state", { 
      user: user ? { 
        id: user.id, 
        isAnonymous: user.isAnonymous,
        email: user.email,
        name: user.name 
      } : null, 
      isLoading 
    });
    
    // If we have a user at this point, make sure to populate the user data
    if (user && !user.isAnonymous && !isLoading) {
      setDisplayName(user.name || "")
      // For bio, we'd need to fetch it from the API since it's not in the EnhancedUser type
      fetchUserData();
    }
  }, [user, isLoading]);

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user && !user.isAnonymous) {
      console.log("🧑‍💻 [ProfilePage] User is authenticated, initializing profile data")
      
      // Initialize profile data from user
      if (user.name && !displayName) {
        setDisplayName(user.name)
      }
      
      if (user.avatar_url && !avatarUrl) {
        setAvatarUrl(user.avatar_url)
      }
      
      // Fetch user data
      fetchUserData()
      
      // Fetch activities
      fetchActivities()
      
      // Fetch votes
      fetchVotes()
    }
  }, [user])

  // Update the fetchUserData to include better error handling
  const fetchUserData = async () => {
    try {
      // Make sure we have a non-anonymous user before fetching data
      if (!user || isLoading || user.isAnonymous) {
        console.log("ProfilePageContent: No authenticated user, skipping user data fetch");
        return;
      }
      
      console.log("ProfilePageContent: Fetching user data for", user.id);
      // Placeholder for API call
      // const response = await fetch(`/api/users/${user.id}`);
      // const userData = await response.json();
      
      // Mock user data
      const userData = {
        displayName: user.name || "User",
        bio: "Product enthusiast and tech reviewer",
        avatarUrl: user.avatar_url || `https://avatar.vercel.sh/${user.name || 'user'}`,
        // Add more user data as needed
      }
      
      // Update state with user data
      setDisplayName(userData.displayName)
      setBio(userData.bio)
      setAvatarUrl(userData.avatarUrl)
      
      // Fetch activities and votes
      fetchActivities()
      fetchVotes()
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Update fetchActivities with similar checks as in ActivitiesPage
  const fetchActivities = async () => {
    try {
      // Make sure we have a user before fetching activities
      if (!user || user.isAnonymous) {
        console.log("ProfilePageContent: No authenticated user, skipping activities fetch");
        setIsFetchingActivities(false);
        return;
      }
      
      console.log("ProfilePageContent: Fetching activities for user", user.id);
      const response = await fetch(`/api/activities?userId=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setIsFetchingActivities(false);
    }
  }
  
  const fetchVotes = async () => {
    try {
      // This would be replaced with a real API call to fetch votes
      const mockVotes = [
        { id: "1", productId: "product1", productName: "Product 1", type: 1, timestamp: new Date().toISOString() },
        { id: "2", productId: "product2", productName: "Product 2", type: -1, timestamp: new Date(Date.now() - 86400000).toISOString() },
      ];
      setVotes(mockVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error("Failed to load votes");
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      
      // Create a simulated upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API to upload the file
      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }
      
      // Update the avatar URL
      setAvatarUrl(result.avatarUrl);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Profile picture updated");
      }, 500);
      
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error("Failed to update profile picture");
    }
  };
  
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setIsUploadingCover(true);
      
      // Similar mock implementation for cover image upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      
      setIsUploadingCover(false);
      toast.success("Cover image updated");
      
    } catch (error) {
      console.error("Error uploading cover image:", error);
      setIsUploadingCover(false);
      toast.error("Failed to update cover image");
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      // Call the API to update profile information
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  const toggleRealtime = () => {
    setRealtimeEnabled(!realtimeEnabled)
    toast.info(realtimeEnabled ? "Real-time updates paused" : "Real-time updates enabled")
  }
  
  // Handle filter change with safer type checks
  const handleFilterChange = (value: string) => {
    setFilterType(value || "all");  // Ensure we never set null
    // Rest of the function
    // ... existing code ...
  }
  
  // Group activities by date
  const groupedActivities = activities
    .filter(activity => !filterType || activity.type === filterType)
    .reduce((groups, activity) => {
      const date = new Date(activity.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {} as Record<string, Activity[]>)
  
  const getActivityIcon = (activity: Activity) => {
    switch (activity.action) {
      case "upvote":
        return <ArrowBigUp className="h-4 w-4 text-green-500" />;
      case "downvote":
        return <ArrowBigDown className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "update":
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  // Add or fix helper functions for date formatting
  const formatTimeAgo = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  // Fix the getActivityText function if it doesn't exist
  const getActivityText = (activity: Activity): string => {
    switch (activity.action) {
      case "upvote":
        return `Upvoted ${activity.productName}`;
      case "downvote":
        return `Downvoted ${activity.productName}`;
      case "comment":
        return `Commented on ${activity.productName}`;
      case "review":
        return `Reviewed ${activity.productName}`;
      case "update":
        return `Updated profile`;
      default:
        return `Interacted with ${activity.productName}`;
    }
  };

  // Render loading state
  if (isLoading) {
    console.log("🧑‍💻 [ProfilePage] Showing loading state")
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading profile...</h1>
            <p className="text-muted-foreground">Please wait while we load your profile information.</p>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, show sign-in prompt but don't redirect
  if (!user || user.isAnonymous) {
    return (
      <div className="container max-w-4xl space-y-8 py-10">
        <h1 className="text-3xl font-bold">Sign in required</h1>
        <p className="text-muted-foreground mb-4">
          You need to be signed in to access your profile.
        </p>
        <Button onClick={() => window.location.href = "/auth/sign-in?next=/profile"}>
          Sign In <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Main render with authenticated user
  console.log("🧑‍💻 [ProfilePage] Rendering authenticated profile for:", user.name || user.email)
  return (
    <div className="container py-6">
      <ProfileHeader />
      
      <div ref={profileRef} className="relative mb-8">
        {/* Cover image */}
        <div className="h-48 sm:h-64 w-full rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 relative">
          {coverImage && (
            <Image
              src={coverImage}
              alt="Cover"
              fill
              className="object-cover rounded-xl"
            />
          )}
          <Button
            size="sm"
            variant="outline"
            className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm"
            onClick={() => coverInputRef.current?.click()}
          >
            <FileImage className="h-4 w-4 mr-2" />
            {coverImage ? "Change Cover" : "Add Cover"}
          </Button>
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            onChange={handleCoverImageUpload}
            accept="image/*"
          />
        </div>
        
        {/* Avatar - positioned to overlay on the cover image */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={avatarUrl || `https://avatar.vercel.sh/${displayName}`} />
              <AvatarFallback className="text-4xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarUpload}
              accept="image/*"
            />
          </div>
        </div>
      </div>
      
      {/* User info section */}
      <div className="mt-20 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{displayName || 'User'}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-8 w-8"
              onClick={() => setIsEditingProfile(true)}
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">{bio || 'No bio yet'}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="mr-2">
                  <BellRing className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {/* Main content tabs */}
      <Tabs defaultValue="activities" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your recent interactions on the platform</CardDescription>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <Switch
                    id="realtime"
                    checked={realtimeEnabled}
                    onCheckedChange={toggleRealtime}
                  />
                  <Label htmlFor="realtime" className="ml-2">Realtime</Label>
                </div>
                <Select value={filterType || "all"} onValueChange={(value) => handleFilterChange(value)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="vote">Votes</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                    <SelectItem value="profile">Profile Updates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No activities yet</h3>
                    <p className="text-muted-foreground">Your interactions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                        <div className="p-2 rounded-full bg-accent mr-3">
                          {getActivityIcon(activity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{getActivityText(activity)}</p>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="text-sm text-muted-foreground cursor-help flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-auto">
                                <p className="text-sm">{formatDate(activity.timestamp)}</p>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                          )}
                          <div className="mt-2">
                            <Button variant="link" className="p-0 h-auto text-sm" asChild>
                              <Link href={`/products/${activity.productId}`}>View Product</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Votes Tab */}
        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle>Your Votes</CardTitle>
              <CardDescription>Products you've voted on</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {votes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Vote className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No votes yet</h3>
                    <p className="text-muted-foreground">Your votes will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {votes.map((vote) => (
                      <div key={vote.id} className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                        <div className="p-2 rounded-full bg-accent mr-3">
                          {vote.type === 1 ? (
                            <ArrowBigUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowBigDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {vote.type === 1 ? 'Upvoted' : 'Downvoted'} {vote.productName}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(vote.timestamp)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <Button variant="link" className="p-0 h-auto text-sm" asChild>
                              <Link href={`/products/${vote.productId}`}>View Product</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Your activity statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-lg font-medium">Upvotes</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {votes.filter(v => v.type === 1).length || 23}
                  </p>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ThumbsDown className="h-5 w-5 mr-2 text-red-500" />
                    <h3 className="text-lg font-medium">Downvotes</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {votes.filter(v => v.type === -1).length || 12}
                  </p>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-lg font-medium">Comments</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {activities.filter(a => a.type === 'comment').length || 7}
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Voting Pattern</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Upvotes vs Downvotes</span>
                      <span>{Math.round(votes.filter(v => v.type === 1).length / Math.max(votes.length, 1) * 100) || 66}% upvotes</span>
                    </div>
                    <Progress value={Math.round(votes.filter(v => v.type === 1).length / Math.max(votes.length, 1) * 100) || 66} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Activity Level</span>
                      <span>Medium</span>
                    </div>
                    <Progress value={55} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements you've earned on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Tag className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      <p>1</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">Early Adopter</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-accent/50 flex items-center justify-center">
                    <Vote className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mt-2">Voter</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-accent/50 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mt-2">Commenter</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-accent/50 flex items-center justify-center">
                    <PenSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mt-2">Reviewer</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Early Adopter</h3>
                    </div>
                    <Badge>Achieved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Joined during the beta phase of the platform.</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Vote className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Power Voter</h3>
                    </div>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Cast 100+ votes on products.</p>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Progress</span>
                      <span>{votes.length || 35}/100</span>
                    </div>
                    <Progress value={(votes.length || 35)} max={100} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Profile edit dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export the main page component that uses the client wrapper
export default function ProfilePage() {
  return (
    <ProfileClientWrapper>
      <ProfilePageContent />
    </ProfileClientWrapper>
  )
}
