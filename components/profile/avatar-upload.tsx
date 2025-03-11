"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import Image from "next/image"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarUpdated?: (url: string) => void
}

export function AvatarUpload({ currentAvatarUrl, onAvatarUpdated }: AvatarUploadProps) {
  const { user } = useEnhancedAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  
  // Update avatar URL when user changes
  useEffect(() => {
    setAvatarUrl(user?.avatar_url || currentAvatarUrl || null)
  }, [user, currentAvatarUrl])
  
  const simulateProgress = () => {
    setUploadProgress(0)
    setIsUploading(true)
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)
    
    return () => clearInterval(interval)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please select an image file (JPEG, PNG, etc.)"
      })
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB"
      })
      return
    }
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsDialogOpen(true)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  const confirmUpload = async () => {
    const cleanup = simulateProgress()
    
    try {
      // In a real app, this would upload to a storage service like S3 or Supabase Storage
      // For this demo, we'll simulate an upload and use the preview as the final URL
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
      
      setUploadProgress(100)
      
      // In a real app, we would get the URL from the storage service
      // For now, we'll use the preview URL as the "uploaded" URL
      setAvatarUrl(previewUrl)
      
      if (onAvatarUpdated && previewUrl) {
        onAvatarUpdated(previewUrl)
      }
      
      // Update the user in local storage to simulate a real update
      if (user && previewUrl) {
        const updatedUser = {
          ...user,
          avatar_url: previewUrl
        }
        
        localStorage.setItem('authUser', JSON.stringify(updatedUser))
      }
      
      toast.success("Profile picture updated")
      
      setIsDialogOpen(false)
      
      // Force refresh to update UI
      router.refresh()
    } catch (error) {
      toast.error("Upload failed", {
        description: "There was an error uploading your avatar. Please try again."
      })
    } finally {
      setIsUploading(false)
      cleanup()
    }
  }
  
  const cancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{displayName}</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              Change Avatar
            </Button>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Preview your new profile picture before confirming.
            </DialogDescription>
          </DialogHeader>
          
          {previewUrl && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-primary/20">
                <Image 
                  src={previewUrl} 
                  fill 
                  alt="Avatar preview" 
                  className="object-cover"
                />
              </div>
              
              {isUploading && (
                <div className="w-full space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-center text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button variant="ghost" onClick={cancelUpload} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={confirmUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Confirm & Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 