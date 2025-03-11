"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { VoteButtons } from "@/components/products/vote-buttons"
import { toast } from "sonner"
import { ArrowBigUp, ArrowBigDown, RefreshCw, Zap } from "lucide-react"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates"

// Mock product for testing
const mockProduct = {
  id: "test-product-1",
  name: "Test Product",
  description: "This is a test product for real-time vote updates",
  upvotes: 5,
  downvotes: 2,
  score: 3,
  category: "Test",
  image: "https://placehold.co/400x300/333/FFF?text=Test+Product",
  created_at: new Date().toISOString(),
}

export default function TestVotePage() {
  const { user } = useEnhancedAuth()
  const [simulationActive, setSimulationActive] = useState(false)
  
  // Initialize real-time updates
  useRealtimeUpdates()
  
  // Simulate vote updates
  useEffect(() => {
    if (!simulationActive) return
    
    const interval = setInterval(() => {
      // Randomly decide what type of vote update to simulate
      const action = Math.random() > 0.7 ? 'UPDATE' : Math.random() > 0.5 ? 'INSERT' : 'DELETE'
      const voteType = action === 'DELETE' ? null : Math.random() > 0.5 ? 1 : -1
      const oldVoteType = action === 'UPDATE' ? (voteType === 1 ? -1 : 1) : action === 'DELETE' ? (Math.random() > 0.5 ? 1 : -1) : null
      
      // Create and dispatch the event
      window.dispatchEvent(new CustomEvent('vote-update', {
        detail: {
          productId: mockProduct.id,
          voteType,
          action,
          oldVoteType,
          timestamp: new Date().toISOString()
        }
      }))
      
      // Log the simulated event
      console.log('Simulated vote update:', {
        productId: mockProduct.id,
        voteType,
        action,
        oldVoteType,
      })
      
    }, 5000) // Simulate a vote every 5 seconds
    
    return () => clearInterval(interval)
  }, [simulationActive])
  
  // Toggle simulation
  const toggleSimulation = () => {
    const newState = !simulationActive
    setSimulationActive(newState)
    toast.info(newState ? 'Vote simulation started' : 'Vote simulation stopped')
  }
  
  // Manually trigger a vote update
  const triggerVoteUpdate = (action: string, voteType: number | null, oldVoteType: number | null) => {
    window.dispatchEvent(new CustomEvent('vote-update', {
      detail: {
        productId: mockProduct.id,
        voteType,
        action,
        oldVoteType,
        timestamp: new Date().toISOString()
      }
    }))
    
    toast.success('Manual vote update triggered', {
      description: `Action: ${action}, Vote Type: ${voteType === 1 ? 'Upvote' : voteType === -1 ? 'Downvote' : 'None'}`
    })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Real-time Vote Updates Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Product</CardTitle>
            <CardDescription>
              This product is used to test real-time vote updates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <VoteButtons 
              product={mockProduct} 
              initialUpvotes={mockProduct.upvotes}
              initialDownvotes={mockProduct.downvotes}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              ID: {mockProduct.id}
            </div>
            <div className="text-sm text-muted-foreground">
              Score: {mockProduct.score}
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>
              Trigger vote updates to test real-time functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Automatic Simulation</span>
              <Button 
                variant={simulationActive ? "destructive" : "default"}
                onClick={toggleSimulation}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {simulationActive ? "Stop Simulation" : "Start Simulation"}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Manual Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => triggerVoteUpdate('INSERT', 1, null)}
                >
                  <ArrowBigUp className="h-4 w-4 text-green-500" />
                  New Upvote
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => triggerVoteUpdate('INSERT', -1, null)}
                >
                  <ArrowBigDown className="h-4 w-4 text-red-500" />
                  New Downvote
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => triggerVoteUpdate('UPDATE', 1, -1)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Change Vote
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => triggerVoteUpdate('DELETE', null, 1)}
                >
                  <ArrowBigUp className="h-4 w-4 text-muted-foreground" />
                  Remove Upvote
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => triggerVoteUpdate('DELETE', null, -1)}
                >
                  <ArrowBigDown className="h-4 w-4 text-muted-foreground" />
                  Remove Downvote
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            {user ? (
              <span>Logged in as: {user.email}</span>
            ) : (
              <span>Not logged in</span>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-card rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-2">How This Works</h2>
        <p className="mb-4">
          This page demonstrates real-time vote updates using custom events. In a production environment, 
          these events would come from a real-time database like Supabase.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The <code>VoteButtons</code> component listens for vote update events and updates its UI accordingly.</li>
          <li>The <code>VoteNotifications</code> component shows toast notifications when votes are cast.</li>
          <li>You can cast votes directly using the vote buttons or simulate votes from other users.</li>
          <li>The simulation will trigger random vote events every 5 seconds.</li>
          <li>Manual triggers let you test specific vote scenarios.</li>
        </ul>
      </div>
    </div>
  )
} 