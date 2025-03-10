import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase, { createProductUpdateChannel } from '../lib/supabase-client';

/**
 * Custom hook for real-time voting functionality
 * Works with both Supabase real-time updates and REST API fallback
 */
export function useRealTimeVote(productId) {
  const [voteData, setVoteData] = useState({
    upvotes: 0,
    downvotes: 0,
    voteType: null,
    hasVoted: false,
    loading: true,
    error: null,
  });
  
  // Get or generate a client ID for anonymous voting
  const [clientId, setClientId] = useState(() => {
    // Try to get from localStorage if in browser environment
    if (typeof window !== 'undefined') {
      const storedClientId = localStorage.getItem('voter_client_id');
      if (storedClientId) return storedClientId;
      
      // Generate a new one if not found
      const newClientId = `anon-${uuidv4()}`;
      localStorage.setItem('voter_client_id', newClientId);
      return newClientId;
    }
    // Fallback for server-side rendering
    return null;
  });
  
  // Function to check the current vote status
  const checkVoteStatus = useCallback(async () => {
    if (!productId || !clientId) return;
    
    try {
      const response = await fetch(`/api/vote?productId=${productId}&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setVoteData(prev => ({
          ...prev,
          upvotes: result.data.upvotes,
          downvotes: result.data.downvotes,
          voteType: result.data.voteType,
          hasVoted: result.data.hasVoted,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(result.error || 'Failed to check vote status');
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
      setVoteData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check vote status',
      }));
    }
  }, [productId, clientId]);
  
  // Function to submit a vote
  const submitVote = useCallback(async (voteType) => {
    if (!productId || !clientId) return;
    
    // Update the UI optimistically
    setVoteData(prev => {
      const newVoteData = { ...prev, loading: true };
      
      // If voting the same way, toggle the vote off
      if (prev.voteType === voteType) {
        if (voteType === 1) newVoteData.upvotes--;
        if (voteType === -1) newVoteData.downvotes--;
        newVoteData.voteType = null;
        newVoteData.hasVoted = false;
      } 
      // If changing vote type, update accordingly
      else if (prev.hasVoted) {
        if (prev.voteType === 1) newVoteData.upvotes--;
        if (prev.voteType === -1) newVoteData.downvotes--;
        
        if (voteType === 1) newVoteData.upvotes++;
        if (voteType === -1) newVoteData.downvotes++;
        
        newVoteData.voteType = voteType;
      } 
      // If voting for the first time
      else {
        if (voteType === 1) newVoteData.upvotes++;
        if (voteType === -1) newVoteData.downvotes++;
        
        newVoteData.voteType = voteType;
        newVoteData.hasVoted = true;
      }
      
      return newVoteData;
    });
    
    // Actually submit the vote to the server
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          voteType,
          clientId,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update state with the actual results from the server
        setVoteData(prev => ({
          ...prev,
          upvotes: result.data.upvotes,
          downvotes: result.data.downvotes,
          voteType: result.data.voteType,
          hasVoted: result.data.voteType !== null,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      
      // Revert to the previous state if there was an error
      checkVoteStatus();
      
      setVoteData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to submit vote',
      }));
    }
  }, [productId, clientId, checkVoteStatus]);
  
  // Set up real-time updates via Supabase
  useEffect(() => {
    if (!productId) return;
    
    // Check the initial vote status
    checkVoteStatus();
    
    // Set up real-time subscription
    const channel = createProductUpdateChannel(productId, (payload) => {
      // Update the vote counts when changes occur
      if (payload.new) {
        const newVote = payload.new;
        setVoteData(prev => ({
          ...prev,
          upvotes: newVote.upvotes,
          downvotes: newVote.downvotes,
          // Keep the current user's vote type the same
          // The server will handle if this user is the one who made the change
        }));
      }
    });
    
    // Also subscribe to the global updates channel for votes
    const globalChannel = supabase
      .channel('global-updates')
      .on('broadcast', { event: 'global-update' }, (payload) => {
        if (payload.payload?.type === 'vote-update' && 
            payload.payload.productId === productId) {
          // Update with the broadcast data
          const update = payload.payload;
          setVoteData(prev => ({
            ...prev,
            upvotes: update.upvotes,
            downvotes: update.downvotes,
            // Only update our vote type if this is our client ID
            voteType: clientId === update.clientId ? update.voteType : prev.voteType,
            hasVoted: clientId === update.clientId ? update.voteType !== null : prev.hasVoted,
          }));
        }
      })
      .subscribe();
    
    // Clean up subscriptions when unmounting
    return () => {
      channel.unsubscribe();
      globalChannel.unsubscribe();
    };
  }, [productId, clientId, checkVoteStatus]);
  
  return {
    upvotes: voteData.upvotes,
    downvotes: voteData.downvotes,
    score: voteData.upvotes - voteData.downvotes,
    voteType: voteData.voteType,
    hasVoted: voteData.hasVoted,
    loading: voteData.loading,
    error: voteData.error,
    submitVote,
    checkVoteStatus,
    clientId,
  };
} 