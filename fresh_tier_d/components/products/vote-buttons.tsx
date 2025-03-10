import React, { useState } from 'react';

interface VoteButtonsProps {
  productId: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialVoteType?: number | null;
}

export default function VoteButtons({
  productId,
  initialUpvotes,
  initialDownvotes,
  initialVoteType = null
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(initialVoteType);

  const handleVote = async (voteType: number) => {
    // If user clicks the same vote type again, remove their vote
    if (userVote === voteType) {
      if (voteType === 1) {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
      setUserVote(null);
    } 
    // If user is switching their vote
    else if (userVote !== null) {
      if (voteType === 1) {
        setUpvotes(upvotes + 1);
        setDownvotes(downvotes - 1);
      } else {
        setUpvotes(upvotes - 1);
        setDownvotes(downvotes + 1);
      }
      setUserVote(voteType);
    } 
    // If user is voting for the first time
    else {
      if (voteType === 1) {
        setUpvotes(upvotes + 1);
      } else {
        setDownvotes(downvotes + 1);
      }
      setUserVote(voteType);
    }

    try {
      // This would typically be an API call to record the vote
      const clientId = 'test-client-id'; // In a real app, this would be a unique identifier
      
      console.log(`Voted ${voteType === 1 ? 'up' : 'down'} for product ${productId}`);
      
      // Mock API call
      /*
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, voteType, clientId }),
      });
      */
    } catch (error) {
      console.error('Error voting:', error);
      // Revert the optimistic update on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      setUserVote(initialVoteType);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px' 
    }}>
      <button
        onClick={() => handleVote(1)}
        style={{
          backgroundColor: userVote === 1 ? '#0ea5e9' : '#f1f5f9',
          color: userVote === 1 ? 'white' : '#475569',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>↑</span>
        <span>{upvotes}</span>
      </button>
      
      <button
        onClick={() => handleVote(-1)}
        style={{
          backgroundColor: userVote === -1 ? '#f43f5e' : '#f1f5f9',
          color: userVote === -1 ? 'white' : '#475569',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>↓</span>
        <span>{downvotes}</span>
      </button>
    </div>
  );
} 