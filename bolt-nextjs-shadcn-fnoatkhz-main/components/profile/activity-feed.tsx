"use client"

import { UserProfile } from "@/types/user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ActivityFeedProps {
  user: UserProfile
}

export function ActivityFeed({ user }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote': return ThumbsUp
      case 'review': return Star
      case 'comment': return MessageSquare
      default: return ThumbsUp
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.activityLog.length === 0 ? (
            <p className="text-center text-muted-foreground">No recent activity</p>
          ) : (
            user.activityLog.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              
              return (
                <Link
                  key={activity.id}
                  href={`/products/${activity.productId}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {activity.action} {activity.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}