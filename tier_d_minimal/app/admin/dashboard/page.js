'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated via cookie
    const isAuthenticated = document.cookie.includes('tier_d_auth_token');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    
    // Simulate fetching analytics data
    setTimeout(() => {
      setAnalyticsData({
        summary: {
          totalProducts: 12,
          totalVotes: 278,
          totalUpvotes: 201,
          totalDownvotes: 77,
          voteRatio: 0.72,
          averageScore: 10.3,
          totalReviews: 45,
          averageRating: 4.2
        },
        topProducts: [
          {
            id: 'prod_8',
            name: 'Smart Fitness Watch',
            score: 27,
            upvotes: 31,
            downvotes: 4
          },
          {
            id: 'prod_6',
            name: 'Ultra HD Smart TV',
            score: 19,
            upvotes: 25,
            downvotes: 6
          },
          {
            id: 'prod_12',
            name: 'Bluetooth Wireless Earbuds',
            score: 18,
            upvotes: 21,
            downvotes: 3
          },
          {
            id: 'prod_2',
            name: 'Smart Home Assistant Hub',
            score: 17,
            upvotes: 22,
            downvotes: 5
          },
          {
            id: 'prod_3',
            name: 'Wireless Noise-Cancelling Headphones',
            score: 16,
            upvotes: 18,
            downvotes: 2
          }
        ],
        categoryDistribution: [
          { name: 'electronics', count: 2, votes: 58, score: 36, percentage: 17 },
          { name: 'audio', count: 2, votes: 44, score: 34, percentage: 17 },
          { name: 'fitness', count: 2, votes: 54, score: 42, percentage: 17 },
          { name: 'kitchen', count: 2, votes: 24, score: 22, percentage: 17 },
          { name: 'outdoor', count: 2, votes: 20, score: 18, percentage: 17 },
          { name: 'home', count: 1, votes: 11, score: 9, percentage: 8 },
          { name: 'office', count: 1, votes: 18, score: 12, percentage: 8 }
        ],
        trendData: Array.from({ length: 7 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            votes: 10 + Math.floor(Math.random() * 40),
            views: 50 + Math.floor(Math.random() * 150),
            reviews: Math.floor(Math.random() * 8)
          };
        })
      });
      setLoading(false);
    }, 1000);
  }, [router]);
  
  const handleSignOut = () => {
    // Clear auth cookie
    document.cookie = 'tier_d_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Monitor product performance and user activity
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/"
            style={{ 
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              color: '#4b5563',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            View Site
          </Link>
          
          <button
            onClick={handleSignOut}
            style={{ 
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p>Loading analytics data...</p>
        </div>
      ) : !analyticsData ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p>No analytics data available</p>
        </div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <SummaryCard 
              title="Total Products" 
              value={analyticsData.summary.totalProducts}
              icon="📦"
              color="#3b82f6"
            />
            <SummaryCard 
              title="Total Votes" 
              value={analyticsData.summary.totalVotes}
              icon="👍"
              color="#10b981"
            />
            <SummaryCard 
              title="Vote Ratio" 
              value={`${(analyticsData.summary.voteRatio * 100).toFixed(1)}%`}
              icon="📊"
              color="#f59e0b"
            />
            <SummaryCard 
              title="Average Score" 
              value={analyticsData.summary.averageScore.toFixed(1)}
              icon="⭐"
              color="#8b5cf6"
            />
          </div>
          
          {/* Top Products */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              Top Ranked Products
            </h2>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', color: '#4b5563' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>Score</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>Upvotes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>Downvotes</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        {product.name}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'center', 
                        fontSize: '0.875rem', 
                        color: product.score > 0 ? '#10b981' : product.score < 0 ? '#ef4444' : '#6b7280',
                        fontWeight: 'bold'
                      }}>
                        {product.score > 0 ? `+${product.score}` : product.score}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#10b981' }}>
                        {product.upvotes}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#ef4444' }}>
                        {product.downvotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary card component
function SummaryCard({ title, value, icon, color }) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ 
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: `${color}10`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem'
      }}>
        {icon}
      </div>
      
      <div>
        <h3 style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{title}</h3>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
} 