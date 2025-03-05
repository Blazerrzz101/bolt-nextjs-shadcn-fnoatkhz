"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getClientId, clearClientId, generateClientId } from '@/utils/client-id';

// Define user interface
export interface EnhancedUser {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  isAnonymous: boolean;
}

// Define context
interface EnhancedAuthContextType {
  user: EnhancedUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  getAuthStatus: () => Promise<EnhancedUser | null>;
  refreshAuthState: () => Promise<void>;
  isAuthenticated: boolean;
  remainingAnonymousVotes: number;
}

// Create context
const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

// Provider component
export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [remainingAnonymousVotes, setRemainingAnonymousVotes] = useState<number>(5);
  const { toast } = useToast();

  // Get authentication status
  const getAuthStatus = async (): Promise<EnhancedUser | null> => {
    console.log("🔐 [EnhancedAuthProvider] Checking auth status...");
    try {
      // For now, we're using mock data/localStorage
      // In a real app, this would call a Supabase/Firebase auth endpoint
      const storedUser = localStorage.getItem('authUser');
      console.log("🔐 [EnhancedAuthProvider] localStorage authUser:", storedUser || "Not found");
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("🔐 [EnhancedAuthProvider] Authenticated user found:", {
            id: parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            isAnonymous: parsedUser.isAnonymous
          });
          
          // Force isAnonymous to be a boolean in case it's stored as a string
          parsedUser.isAnonymous = parsedUser.isAnonymous === true || parsedUser.isAnonymous === "true";
          
          // Log sanitized user
          console.log("🔐 [EnhancedAuthProvider] Sanitized user:", {
            id: parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            isAnonymous: parsedUser.isAnonymous,
            isAnonymousType: typeof parsedUser.isAnonymous
          });
          
          return parsedUser;
        } catch (parseError) {
          console.error('🔐 [EnhancedAuthProvider] Error parsing stored user:', parseError);
          // Clear invalid storage
          localStorage.removeItem('authUser');
        }
      }
      
      // If no authenticated user found, create an anonymous one
      const clientId = getClientId(); // This uses 'tierd_client_id' in localStorage
      console.log("🔐 [EnhancedAuthProvider] No auth user found, using clientId:", clientId);
      
      const anonymousUser: EnhancedUser = {
        id: clientId,
        isAnonymous: true
      };
      
      console.log("🔐 [EnhancedAuthProvider] Created anonymous user:", anonymousUser);
      return anonymousUser;
    } catch (error) {
      console.error('🔐 [EnhancedAuthProvider] Error checking auth status:', error);
      return null;
    }
  };

  // Get remaining anonymous votes
  const fetchRemainingVotes = async () => {
    try {
      if (!user || !user.isAnonymous) {
        // If user is authenticated, they don't have a limit
        setRemainingAnonymousVotes(999);
        return;
      }
      
      const clientId = getClientId();
      const response = await fetch(`/api/vote/remaining-votes?clientId=${clientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRemainingAnonymousVotes(data.remainingVotes || 0);
      }
    } catch (error) {
      console.error('Error fetching remaining votes:', error);
    }
  };

  // Force refresh the authentication state
  const refreshAuthState = async () => {
    console.log("🔐 [EnhancedAuthProvider] Forcing refresh of auth state");
    setIsLoading(true);
    try {
      const authUser = await getAuthStatus();
      console.log("🔐 [EnhancedAuthProvider] Refreshed auth state:", authUser);
      setUser(authUser);
      
      // Update vote limits based on user type
      if (authUser && authUser.isAnonymous) {
        await fetchRemainingVotes();
      } else {
        setRemainingAnonymousVotes(999); // No limit for authenticated users
      }
    } catch (error) {
      console.error("🔐 [EnhancedAuthProvider] Error refreshing auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize user authentication state
  useEffect(() => {
    console.log("🔐 [EnhancedAuthProvider] Initializing authentication state...");
    
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const authUser = await getAuthStatus();
        console.log("🔐 [EnhancedAuthProvider] Auth status result:", authUser ? {
          id: authUser.id,
          isAnonymous: authUser.isAnonymous,
          email: authUser.email,
          name: authUser.name
        } : "No user found");
        
        setUser(authUser);
        
        // Fetch remaining votes for anonymous users
        if (authUser && authUser.isAnonymous) {
          console.log("🔐 [EnhancedAuthProvider] User is anonymous, fetching remaining votes");
          await fetchRemainingVotes();
        } else {
          console.log("🔐 [EnhancedAuthProvider] User is authenticated, no vote limits");
          setRemainingAnonymousVotes(999); // No limit for authenticated users
        }
      } catch (error) {
        console.error('🔐 [EnhancedAuthProvider] Error during initialization:', error);
        // Create an anonymous user as fallback
        const clientId = getClientId();
        const anonymousUser: EnhancedUser = {
          id: clientId,
          isAnonymous: true
        };
        console.log("🔐 [EnhancedAuthProvider] Creating fallback anonymous user:", anonymousUser);
        setUser(anonymousUser);
      } finally {
        setIsLoading(false);
        console.log("🔐 [EnhancedAuthProvider] Initialization complete, isLoading set to false");
      }
    };

    initAuth();
    
    // Listen for storage events (for multi-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      console.log("🔐 [EnhancedAuthProvider] Storage change detected:", event.key);
      if (event.key === 'authUser') {
        if (event.newValue) {
          try {
            const parsedUser = JSON.parse(event.newValue);
            console.log("🔐 [EnhancedAuthProvider] User changed in another tab:", {
              id: parsedUser.id,
              isAnonymous: parsedUser.isAnonymous,
              email: parsedUser.email,
              name: parsedUser.name
            });
            setUser(parsedUser);
          } catch (error) {
            console.error("🔐 [EnhancedAuthProvider] Error parsing storage event:", error);
          }
        } else {
          console.log("🔐 [EnhancedAuthProvider] User logged out in another tab");
          // User logged out in another tab, create a new anonymous user
          const clientId = getClientId();
          setUser({
            id: clientId,
            isAnonymous: true
          });
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debug log whenever authenticated state changes
  useEffect(() => {
    const isAuth = !!user && !user.isAnonymous;
    console.log("🔐 [EnhancedAuthProvider] Auth state changed:", {
      isAuthenticated: isAuth,
      user: user ? {
        id: user.id,
        isAnonymous: user.isAnonymous,
        email: user.email,
        name: user.name
      } : "No user"
    });
    
    // Log to localStorage for debugging
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_isAuthenticated', String(isAuth));
      localStorage.setItem('debug_userState', JSON.stringify({
        user: user ? {
          id: user.id,
          isAnonymous: user.isAnonymous,
          email: user.email,
          name: user.name
        } : null,
        isAuthenticated: isAuth,
        timestamp: new Date().toISOString()
      }));
    }
  }, [user]);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    console.log("🔐 [EnhancedAuthProvider] Starting sign in process for", email);
    setIsLoading(true);
    try {
      // This would normally call your auth API
      // For now, we'll simulate a successful login
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Clear any existing user data
      localStorage.removeItem('authUser');
      
      // Generate a mock user
      const mockUser: EnhancedUser = {
        id: `user_${Math.random().toString(36).substring(2, 10)}`,
        email,
        name: email.split('@')[0],
        avatar_url: `https://avatar.vercel.sh/${email.split('@')[0]}`,
        isAnonymous: false  // Explicitly set to false (boolean)
      };
      
      console.log("🔐 [EnhancedAuthProvider] Created user object:", mockUser);
      
      // Explicitly verify and log the isAnonymous property
      console.log("🔐 [EnhancedAuthProvider] User isAnonymous check:", {
        value: mockUser.isAnonymous,
        type: typeof mockUser.isAnonymous,
        booleanValue: mockUser.isAnonymous === false
      });
      
      // Store user in localStorage (in a real app, this would be a JWT token or session)
      const userString = JSON.stringify(mockUser);
      localStorage.setItem('authUser', userString);
      
      // Verify the stored user
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("🔐 [EnhancedAuthProvider] Verified stored user:", {
            id: parsedUser.id,
            email: parsedUser.email,
            isAnonymous: parsedUser.isAnonymous,
            isAnonymousType: typeof parsedUser.isAnonymous
          });
        } catch (e) {
          console.error("🔐 [EnhancedAuthProvider] Error parsing stored user:", e);
        }
      }
      
      setUser(mockUser);
      
      // Force a refresh of the auth state to ensure everything is in sync
      await refreshAuthState();
      
      toast({
        title: 'Signed in successfully',
        description: `Welcome back, ${mockUser.name || 'User'}!`,
      });
      
      console.log("🔐 [EnhancedAuthProvider] Sign in successful, returning true");
      
      return true;
    } catch (error: any) {
      console.error('🔐 [EnhancedAuthProvider] Error signing in:', error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // This would normally call your auth API
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Generate a mock user
      const mockUser: EnhancedUser = {
        id: `user_${Math.random().toString(36).substring(2, 10)}`,
        email,
        name: name || email.split('@')[0],
        isAnonymous: false
      };
      
      // Get the client ID that was used for anonymous voting
      const clientId = getClientId();
      
      // In a real app, you'd make an API call to create an account
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store the user in localStorage
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      
      // Make an API call to associate this client ID with the new user
      await fetch('/api/vote/link-anonymous-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mockUser.id,
          clientId: clientId,
        }),
      });
      
      setUser(mockUser);
      
      // Reset vote limit since user is now authenticated
      setRemainingAnonymousVotes(999);
      
      toast({
        title: 'Account created successfully',
        description: `Welcome, ${mockUser.name || mockUser.email}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    console.log("🔐 [EnhancedAuthProvider] Signing out user...")
    setIsLoading(true);
    try {
      // This would normally call your auth API
      localStorage.removeItem('authUser');
      localStorage.removeItem('debug_isAuthenticated');
      localStorage.removeItem('debug_userState');
      
      // Generate a new client ID to prevent vote manipulation
      const oldClientId = getClientId();
      clearClientId();
      const newClientId = generateClientId(); // This generates a new ID
      
      console.log("🔐 [EnhancedAuthProvider] Generated new client ID after sign-out:", newClientId);
      
      // Notify the vote API about the sign out to clear votes
      try {
        await fetch('/api/vote/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldClientId,
            newClientId
          }),
        });
      } catch (error) {
        console.error("🔐 [EnhancedAuthProvider] Error resetting votes on sign out:", error);
      }
      
      // Create anonymous user
      const anonymousUser: EnhancedUser = {
        id: newClientId,
        isAnonymous: true
      };
      
      setUser(anonymousUser);
      
      // Reset vote limit for new anonymous user
      await fetchRemainingVotes();
      
      toast({
        title: 'Signed out successfully',
      });
      
      // Force page reload to ensure all components update with new client ID
      window.location.href = '/';
    } catch (error) {
      console.error('🔐 [EnhancedAuthProvider] Sign out error:', error);
      
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Provide context
  const isAuthenticated = user ? !user.isAnonymous : false;
  
  return (
    <EnhancedAuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      getAuthStatus,
      refreshAuthState,
      isAuthenticated,
      remainingAnonymousVotes,
    }}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
} 