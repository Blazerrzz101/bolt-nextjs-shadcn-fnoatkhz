'use client';

import { AuthNav } from '@/components/auth/auth-nav';
import { UserNav } from '@/components/auth/user-nav';
import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/components/auth/auth-provider';

/**
 * AuthNavigation component - handles rendering the appropriate navigation
 * based on authentication state. This component only renders on the client.
 */
export function AuthNavigation() {
  const { isAuthenticated, isLoading } = useEnhancedAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading indicator until mounted and auth state is determined
  if (!mounted || isLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  // Now that we're on the client and have auth state, we can render conditionally
  return isAuthenticated ? <UserNav /> : <AuthNav />;
} 