'use client';

import { useState } from 'react';

export default function ProductCard({ product }) {
  const [productData, setProductData] = useState(product);
  
  const handleVote = async (voteType) => {
    try {
      // Get client ID from localStorage or create a new one
      let clientId = localStorage.getItem('clientId');
      if (!clientId) {
        clientId = 'anon-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('clientId', clientId);
      }
      
      // Optimistic update
      const currentVoteType = productData.voteType;
      let newUpvotes = productData.upvotes;
      let newDownvotes = productData.downvotes;
      
      // If voting the same way, toggle it off
      if (currentVoteType === voteType) {
        if (voteType === 1) newUpvotes--;
        if (voteType === -1) newDownvotes--;
        setProductData({
          ...productData,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newUpvotes - newDownvotes,
          voteType: null
        });
      } else {
        // If changing vote type
        if (currentVoteType === 1) newUpvotes--;
        if (currentVoteType === -1) newDownvotes--;
        if (voteType === 1) newUpvotes++;
        if (voteType === -1) newDownvotes++;
        
        setProductData({
          ...productData,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newUpvotes - newDownvotes,
          voteType: voteType
        });
      }
      
      // Call API
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          voteType: voteType,
          clientId: clientId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update with server data
        setProductData({
          ...productData,
          upvotes: result.data.upvotes,
          downvotes: result.data.downvotes,
          score: result.data.score,
          voteType: result.data.voteType
        });
      } else {
        console.error('Vote failed:', result.error);
        // Revert to original data on error
        setProductData(product);
      }
    } catch (error) {
      console.error('Error voting:', error);
      setProductData(product);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">{productData.name}</h2>
      <p className="text-gray-600 mb-2">{productData.description}</p>
      <div className="flex justify-between items-center">
        <span className="font-bold">${productData.price}</span>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {productData.category}
        </span>
      </div>
      
      <div className="flex items-center mt-4 space-x-4">
        <button 
          className={`flex items-center space-x-1 ${productData.voteType === 1 ? 'text-green-600 font-bold' : 'text-gray-500'}`}
          onClick={() => handleVote(1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span>{productData.upvotes}</span>
        </button>
        
        <span className="text-gray-700 font-bold">Score: {productData.score}</span>
        
        <button 
          className={`flex items-center space-x-1 ${productData.voteType === -1 ? 'text-red-600 font-bold' : 'text-gray-500'}`}
          onClick={() => handleVote(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{productData.downvotes}</span>
        </button>
      </div>
    </div>
  );
}
