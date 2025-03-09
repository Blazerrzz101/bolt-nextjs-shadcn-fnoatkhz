'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../lib/auth';

/**
 * Protected component wrapper for admin routes
 * Redirects to login page if not authenticated
 */
export default function AdminProtected({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/admin/login');
      } else {
        setAuthorized(true);
      }
    };
    
    checkAuth();
    
    // Add window focus event listener to recheck authentication
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('focus', checkAuth);
    };
  }, [router]);
  
  // Show loading state while checking authentication
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Render children if authorized
  return children;
} 