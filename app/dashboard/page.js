'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the secure admin dashboard
export default function DashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to secure dashboard...</p>
      </div>
    </div>
  );
}
