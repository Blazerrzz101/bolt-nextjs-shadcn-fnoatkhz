"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

export function VoteNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useEnhancedAuth()

  useEffect(() => {
    // Only subscribe to notifications if user is authenticated
    if (!user || user.isAnonymous) return

    let subscription: any = null
    
    const setupSubscription = async () => {
      try {
        const supabase = createClient()
        
        // Check if supabase client is available (for build-time safety)
        if (!supabase) {
          console.error("Supabase client not available")
          return
        }
        
        // First, fetch existing notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (error) {
          console.error('Error fetching notifications:', error)
        } else {
          setNotifications(data || [])
          setUnreadCount(data?.filter(n => !n.read).length || 0)
        }
        
        // Subscribe to new notifications
        subscription = supabase
          .channel('notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          }, (payload) => {
            // Update notifications
            setNotifications(current => [payload.new, ...current].slice(0, 5))
            setUnreadCount(count => count + 1)
          })
          .subscribe()
          
      } catch (err) {
        console.error('Error setting up notification subscription:', err)
      }
    }
    
    setupSubscription()
    
    // Cleanup subscription when component unmounts
    return () => {
      if (subscription) {
        const supabase = createClient()
        if (supabase) {
          supabase.channel('notifications').unsubscribe()
        }
      }
    }
  }, [user])
  
  const markAsRead = async () => {
    if (!user || notifications.length === 0) return
    
    try {
      const supabase = createClient()
      
      if (!supabase) return
      
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        
      if (error) {
        console.error('Error marking notifications as read:', error)
      } else {
        // Update local state
        setNotifications(current => 
          current.map(n => ({ ...n, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAsRead}
              className="h-auto text-xs p-1"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded-md ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4 text-muted-foreground">
            No notifications yet
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
} 