'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

interface AnalyticsData {
  totalProducts: number;
  totalVotes: number;
  topProducts: Product[];
  categories: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalProducts: 0,
    totalVotes: 0,
    topProducts: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Check authentication on load
  useEffect(() => {
    // In a real app, we would check the session with a proper API call
    // For this example, we'll use the existence of the admin_session cookie
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        // Process data for analytics
        const products = data.data || [];
        const categories = Array.from(
          new Set(products.map((p: Product) => p.category))
        ).map((categoryName: unknown) => ({
          name: categoryName as string,
          count: products.filter((p: Product) => p.category === categoryName).length
        }));
        
        setAnalyticsData({
          totalProducts: products.length,
          totalVotes: products.reduce((sum: number, p: Product) => sum + p.upvotes + p.downvotes, 0),
          topProducts: [...products].sort((a, b) => b.score - a.score).slice(0, 5),
          categories
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error loading dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleLogout = () => {
    // In a real app, we would call an API to invalidate the session
    // For now, we'll just redirect to the login page
    router.push('/admin');
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#0f172a'
        }}>
          Admin Dashboard
        </h1>
        
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#334155',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          title="Total Products" 
          value={analyticsData.totalProducts.toString()} 
          icon="📦"
        />
        <StatCard 
          title="Total Votes" 
          value={analyticsData.totalVotes.toString()} 
          icon="📊"
        />
        <StatCard 
          title="Categories" 
          value={analyticsData.categories.length.toString()} 
          icon="🏷️"
        />
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#0f172a'
          }}>
            Top Products
          </h2>
          
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Upvotes</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Downvotes</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topProducts.map(product => (
                <tr key={product.id}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{product.name}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{product.category}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{product.upvotes}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{product.downvotes}</td>
                  <td style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid #e2e8f0',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: product.score > 0 ? '#16a34a' : product.score < 0 ? '#dc2626' : '#64748b'
                  }}>
                    {product.score > 0 ? '+' : ''}{product.score}
                  </td>
                </tr>
              ))}
              
              {analyticsData.topProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#0f172a'
          }}>
            Categories
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {analyticsData.categories.map(category => (
              <div key={category.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '4px'
              }}>
                <span>{category.name}</span>
                <span style={{ 
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}>
                  {category.count} products
                </span>
              </div>
            ))}
            
            {analyticsData.categories.length === 0 && (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                No categories available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        backgroundColor: '#f0f9ff',
        color: '#0284c7',
        height: '3rem',
        width: '3rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      
      <div>
        <h3 style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          marginBottom: '0.25rem'
        }}>
          {title}
        </h3>
        <p style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: '#0f172a',
          margin: 0
        }}>
          {value}
        </p>
      </div>
    </div>
  );
} 