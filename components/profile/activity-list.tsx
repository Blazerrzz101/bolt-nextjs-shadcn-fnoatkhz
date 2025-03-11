"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown, MessageSquare, Activity, Filter, Clock, CalendarRange } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"

interface UserActivity {
  id: string
  type: "vote" | "comment" | "review" | "profile_update"
  action: "upvote" | "downvote" | "comment" | "review" | "update"
  productId?: string
  productName?: string
  threadId?: string
  threadTitle?: string
  reviewId?: string
  timestamp: string
  details?: string
}

export function ActivityList() {
  const { user } = useEnhancedAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, we would fetch activities from an API
    // For now, we'll generate mock data
    setIsLoading(true)
    
    const generateMockActivities = () => {
      const mockActivities: UserActivity[] = []
      const types = ["vote", "comment", "review", "profile_update"]
      const actions = {
        "vote": ["upvote", "downvote"],
        "comment": ["comment"],
        "review": ["review"],
        "profile_update": ["update"]
      }
      const productNames = ["Logitech MX Master 3", "Razer DeathAdder V2", "SteelSeries Arctis 7", "Keychron K2", "HyperX Cloud II"]
      const threadTitles = ["Best gaming mouse in 2023?", "Mechanical vs membrane keyboards", "Wireless headphones recommendation", "Budget gaming setup ideas", "RGB: love it or hate it?"]
      
      // Generate 20 random activities
      for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)] as "vote" | "comment" | "review" | "profile_update"
        const possibleActions = actions[type] as any[]
        const action = possibleActions[Math.floor(Math.random() * possibleActions.length)]
        
        // Generate a timestamp between now and 30 days ago
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        
        const activity: UserActivity = {
          id: `activity-${i}`,
          type,
          action: action as any,
          timestamp: date.toISOString(),
        }
        
        // Add type-specific details
        if (type === "vote" || type === "review") {
          const productIdx = Math.floor(Math.random() * productNames.length)
          activity.productId = `product-${productIdx}`
          activity.productName = productNames[productIdx]
          
          if (type === "vote") {
            activity.details = action === "upvote" ? "You upvoted this product" : "You downvoted this product"
          } else {
            activity.details = "You wrote a review for this product"
          }
        } else if (type === "comment") {
          const threadIdx = Math.floor(Math.random() * threadTitles.length)
          activity.threadId = `thread-${threadIdx}`
          activity.threadTitle = threadTitles[threadIdx]
          activity.details = "You commented on this thread"
        } else if (type === "profile_update") {
          activity.details = "You updated your profile information"
        }
        
        mockActivities.push(activity)
      }
      
      // Sort by timestamp descending (newest first)
      return mockActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }
    
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockActivities()
      setActivities(mockData)
      setFilteredActivities(mockData)
      setIsLoading(false)
    }, 800)
    
  }, [user?.id])
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...activities]
    
    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter(activity => activity.type === filter)
    }
    
    // Apply sort order
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB
    })
    
    setFilteredActivities(filtered)
  }, [activities, filter, sortOrder])
  
  const getActivityIcon = (activity: UserActivity) => {
    switch(activity.type) {
      case "vote":
        return activity.action === "upvote" 
          ? <ThumbsUp className="h-4 w-4 text-green-500" /> 
          : <ThumbsDown className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "review":
        return <Activity className="h-4 w-4 text-purple-500" />
      case "profile_update":
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }
  
  const getActivityLabel = (activity: UserActivity) => {
    switch(activity.type) {
      case "vote":
        return activity.action === "upvote" ? "Upvote" : "Downvote"
      case "comment":
        return "Comment"
      case "review":
        return "Review"
      case "profile_update":
        return "Profile Update"
      default:
        return "Activity"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity
          </CardTitle>
          <CardDescription>Loading your recent activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity
        </CardTitle>
        <CardDescription>Your recent activity on the platform</CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
                <SelectItem value="profile_update">Profile Updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No activities found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter !== "all" 
                ? `You don't have any ${filter} activities yet.`
                : "You don't have any activities yet. Start by exploring the platform!"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex gap-4 border-b pb-4 last:border-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {getActivityIcon(activity)}
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {getActivityLabel(activity)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div>
                      {activity.type === "vote" || activity.type === "review" ? (
                        <Link 
                          href={`/products/${activity.productId}`}
                          className="font-medium hover:underline"
                        >
                          {activity.productName}
                        </Link>
                      ) : activity.type === "comment" ? (
                        <Link 
                          href={`/threads/${activity.threadId}`}
                          className="font-medium hover:underline"
                        >
                          {activity.threadTitle}
                        </Link>
                      ) : (
                        <span className="font-medium">Your profile</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
} 