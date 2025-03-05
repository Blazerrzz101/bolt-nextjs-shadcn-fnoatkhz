"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, ThumbsUp, ThumbsDown, MessageSquare, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ActivitiesClientWrapper } from "./client-wrapper"

interface UserActivity {
  id: string
  type: "vote" | "comment" | "review"
  action: "upvote" | "downvote" | "comment" | "review"
  productId: string
  productName: string
  timestamp: string
  details?: string
}

export default function ActivitiesPage() {
  const router = useRouter()
  const { user, isLoading } = useEnhancedAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Add debugging log for authentication state
  useEffect(() => {
    console.log("ActivitiesPage: Authentication state", { 
      user: user ? { 
        id: user.id, 
        isAnonymous: user.isAnonymous,
        email: user.email,
        name: user.name 
      } : null, 
      isLoading 
    });
  }, [user, isLoading]);

  useEffect(() => {
    // Don't redirect immediately, just fetch if user is available
    const fetchActivities = async () => {
      try {
        // Make sure we have a user before fetching activities
        if (!user || user.isAnonymous) {
          console.log("ActivitiesPage: No authenticated user, skipping API call");
          setLoading(false)
          return
        }
        
        console.log("ActivitiesPage: Fetching activities for user", user.id);
        const response = await fetch(`/api/activities?userId=${user.id}`);
        const data = await response.json();
        if (data.success) {
          setActivities(data.activities);
          console.log("ActivitiesPage: Fetched activities:", data.activities.length);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !user.isAnonymous) {
      fetchActivities();
    } else {
      setLoading(false);
    }
  }, [user, isLoading]);

  const getActivityIcon = (activity: UserActivity) => {
    switch (activity.action) {
      case "upvote":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "downvote":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: UserActivity) => {
    switch (activity.action) {
      case "upvote":
        return `Upvoted ${activity.productName}`;
      case "downvote":
        return `Downvoted ${activity.productName}`;
      case "comment":
        return `Commented on ${activity.productName}`;
      case "review":
        return `Reviewed ${activity.productName}`;
      default:
        return `Interacted with ${activity.productName}`;
    }
  };

  // Show loading state while loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Loading activities...</h1>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt but don't redirect
  if (!user || user.isAnonymous) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Sign in to view your activities</h1>
        <p className="mb-4">You need to be signed in to view and manage your activities.</p>
        <Button asChild>
          <Link href="/auth/sign-in?next=/activities">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ActivitiesClientWrapper>
      <div className="container py-6">
        <ProfileHeader />
        
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Your Activities</h1>
        </div>

        {loading ? (
          <div>Loading activities...</div>
        ) : activities.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground">No activities yet</p>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="p-4 space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getActivityIcon(activity)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{getActivityText(activity)}</p>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </ActivitiesClientWrapper>
  )
} 