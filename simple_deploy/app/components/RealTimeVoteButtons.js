import { useState, useEffect } from 'react';
import { useRealTimeVote } from '../../hooks/useRealTimeVote';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * Real-time voting buttons component that shows instant updates
 * Uses the useRealTimeVote hook for Supabase real-time capabilities
 */
export default function RealTimeVoteButtons({ productId, className = '' }) {
  const {
    upvotes,
    downvotes,
    score,
    voteType,
    hasVoted,
    loading,
    error,
    submitVote
  } = useRealTimeVote(productId);

  // Animation states for vote counts
  const [animatingUp, setAnimatingUp] = useState(false);
  const [animatingDown, setAnimatingDown] = useState(false);
  const [previousUpvotes, setPreviousUpvotes] = useState(upvotes);
  const [previousDownvotes, setPreviousDownvotes] = useState(downvotes);

  // Handle vote animations when counts change
  useEffect(() => {
    if (previousUpvotes !== upvotes) {
      setAnimatingUp(true);
      const timeout = setTimeout(() => setAnimatingUp(false), 600);
      setPreviousUpvotes(upvotes);
      return () => clearTimeout(timeout);
    }
  }, [upvotes, previousUpvotes]);

  useEffect(() => {
    if (previousDownvotes !== downvotes) {
      setAnimatingDown(true);
      const timeout = setTimeout(() => setAnimatingDown(false), 600);
      setPreviousDownvotes(downvotes);
      return () => clearTimeout(timeout);
    }
  }, [downvotes, previousDownvotes]);

  // Handler for upvoting
  const handleUpvote = () => {
    if (loading) return; // Prevent multiple clicks while loading
    submitVote(1);
  };

  // Handler for downvoting
  const handleDownvote = () => {
    if (loading) return; // Prevent multiple clicks while loading
    submitVote(-1);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Error message if any */}
      {error && (
        <div className="text-red-500 text-xs mb-1 w-full">{error}</div>
      )}

      {/* Vote count and buttons */}
      <div className="flex flex-col items-center">
        {/* Upvote button */}
        <button
          onClick={handleUpvote}
          disabled={loading}
          className={`p-1 rounded-full transition-transform duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          } ${voteType === 1 ? 'text-green-500' : 'text-gray-400'}`}
          aria-label="Upvote"
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>

        {/* Vote score with animation */}
        <div className="text-center font-semibold w-6">
          <span
            className={`inline-block transition-all duration-300 ${
              animatingUp
                ? 'text-green-500 transform scale-125'
                : animatingDown
                ? 'text-red-500 transform scale-75'
                : ''
            }`}
          >
            {score}
          </span>
        </div>

        {/* Downvote button */}
        <button
          onClick={handleDownvote}
          disabled={loading}
          className={`p-1 rounded-full transition-transform duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          } ${voteType === -1 ? 'text-red-500' : 'text-gray-400'}`}
          aria-label="Downvote"
        >
          <ChevronDownIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Detailed vote counts */}
      <div className="flex flex-col text-xs text-gray-500">
        <div className={animatingUp ? 'text-green-500 font-bold' : ''}>
          {upvotes} upvotes
        </div>
        <div className={animatingDown ? 'text-red-500 font-bold' : ''}>
          {downvotes} downvotes
        </div>
      </div>
    </div>
  );
} 