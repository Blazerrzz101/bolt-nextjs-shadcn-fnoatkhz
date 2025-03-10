"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useVote } from "@/hooks/use-vote"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { VoteButtons } from "@/components/products/vote-buttons"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { testProducts } from "@/lib/mock-data"

// Create a client
const queryClient = new QueryClient()

export default function TestVotePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Vote Test Page</h1>
        <VoteTest />
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}

function VoteTest() {
  const [productId, setProductId] = useState("p1")
  const [voteStatus, setVoteStatus] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { vote, getVoteStatus, remainingVotes } = useVote()

  // Get the current product from our test products
  const currentProduct = testProducts[productId]
  
  // Check vote status on mount and when product changes
  useEffect(() => {
    checkVoteStatus()
  }, [productId])
  
  // Function to check vote status
  const checkVoteStatus = async () => {
    setStatusLoading(true)
    setError(null)
    
    try {
      const status = await getVoteStatus(productId)
      console.log("Vote status:", status)
      setVoteStatus(status)
    } catch (err) {
      console.error("Error checking vote status:", err)
      setError("Failed to check vote status")
    } finally {
      setStatusLoading(false)
    }
  }
  
  // Function to handle voting
  const handleVote = async (voteType: 1 | -1) => {
    setVoteLoading(true)
    setError(null)
    
    try {
      const result = await vote({ id: productId, name: currentProduct?.name || `Product ${productId}` }, voteType)
      console.log("Vote result:", result)
      
      if (result.success) {
        // Refresh vote status
        await checkVoteStatus()
      } else {
        setError(result.error || "Failed to vote")
      }
    } catch (err) {
      console.error("Error voting:", err)
      setError("Failed to vote")
    } finally {
      setVoteLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vote Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading vote status...</span>
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : voteStatus ? (
            <div className="space-y-2">
              <p><strong>Product:</strong> {currentProduct?.name || `Product ${productId}`}</p>
              <p><strong>Upvotes:</strong> {voteStatus.upvotes}</p>
              <p><strong>Downvotes:</strong> {voteStatus.downvotes}</p>
              <p><strong>Score:</strong> {voteStatus.score}</p>
              <p><strong>Your Vote:</strong> {
                voteStatus.voteType === 1 ? "Upvote" : 
                voteStatus.voteType === -1 ? "Downvote" : 
                "None"
              }</p>
              <p><strong>Remaining Votes:</strong> {remainingVotes}</p>
            </div>
          ) : (
            <p>No vote status available</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={checkVoteStatus} 
            disabled={statusLoading}
          >
            {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Status
          </Button>
          <div className="flex items-center gap-4">
            <span>Vote:</span>
            <VoteButtons 
              product={{ id: productId, name: currentProduct?.name || `Product ${productId}` }}
              initialUpvotes={voteStatus?.upvotes ?? 0}
              initialDownvotes={voteStatus?.downvotes ?? 0}
              initialVoteType={voteStatus?.voteType}
              onVote={handleVote}
            />
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Different Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(testProducts).map((id) => (
              <Button 
                key={id}
                onClick={() => setProductId(id)}
                variant={productId === id ? "default" : "outline"}
              >
                {testProducts[id].name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 