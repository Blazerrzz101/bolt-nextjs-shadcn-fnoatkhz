'use client';

import AdminProtected from '../../../components/AdminProtected';
import AnalyticsDashboard from '../../../app/dashboard/AnalyticsDashboard';
import { clearAuthentication } from '../../../lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const handleLogout = () => {
    clearAuthentication();
    router.push('/admin/login');
  };
  
  return (
    <AdminProtected>
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Tier'd Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>
        
        <main>
          <AnalyticsDashboard />
        </main>
      </div>
    </AdminProtected>
  );
} 