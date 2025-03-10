'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearAuthentication } from '../../../lib/auth';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    // Fetch analytics data
    fetchAnalytics();
  }, [router, selectedPeriod, selectedCategory]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/analytics', window.location.origin);
      url.searchParams.append('period', selectedPeriod);
      if (selectedCategory) {
        url.searchParams.append('category', selectedCategory);
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        console.error('Error fetching analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = () => {
    clearAuthentication();
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
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{ 
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white'
          }}
        >
          <option value="day">Last 24 hours</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last year</option>
          <option value="all">All time</option>
        </select>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ 
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white'
          }}
        >
          <option value="">All categories</option>
          <option value="electronics">Electronics</option>
          <option value="audio">Audio</option>
          <option value="fitness">Fitness</option>
          <option value="kitchen">Kitchen</option>
          <option value="home">Home</option>
          <option value="outdoor">Outdoor</option>
          <option value="office">Office</option>
        </select>
      </div>
      
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
                  {analyticsData.topProducts.map((product, index) => (
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
          
          {/* Category Distribution */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              Category Distribution
            </h2>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {analyticsData.categoryDistribution.map((category) => (
                <div 
                  key={category.name}
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: '#374151',
                      textTransform: 'capitalize'
                    }}>
                      {category.name}
                    </span>
                    <span style={{ 
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: '9999px',
                      padding: '0.125rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {category.percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <div>
                      <span>Products: </span>
                      <span style={{ fontWeight: '500' }}>{category.count}</span>
                    </div>
                    <div>
                      <span>Votes: </span>
                      <span style={{ fontWeight: '500' }}>{category.votes}</span>
                    </div>
                    <div>
                      <span>Score: </span>
                      <span style={{ 
                        fontWeight: '500',
                        color: category.score > 0 ? '#10b981' : category.score < 0 ? '#ef4444' : '#6b7280'
                      }}>
                        {category.score > 0 ? `+${category.score}` : category.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activity Trends */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              Activity Trends
            </h2>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
                This simplified chart representation shows activity trends over time.
              </p>
              <div style={{
                display: 'flex',
                height: '150px',
                gap: '4px',
                alignItems: 'flex-end',
                marginTop: '1rem'
              }}>
                {analyticsData.trendData.map((day) => {
                  const maxValue = Math.max(day.votes, day.views / 5, day.reviews * 5);
                  const normalizedVotes = (day.votes / maxValue) * 100;
                  const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={day.date} style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                      <div style={{ 
                        width: '100%', 
                        height: `${normalizedVotes}%`, 
                        backgroundColor: '#3b82f6',
                        borderRadius: '3px 3px 0 0',
                        minHeight: '4px'
                      }} />
                      <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: '0.25rem', transform: 'rotate(-45deg)', transformOrigin: 'left top' }}>
                        {date}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Votes</span>
                </div>
              </div>
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