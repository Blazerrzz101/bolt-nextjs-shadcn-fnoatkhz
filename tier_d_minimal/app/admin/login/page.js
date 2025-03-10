'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // For simplicity in this demo, we'll use hardcoded credentials
      // In a real app, you'd call an API
      if (username === 'admin' && password === 'Tier-dAdmin2024!') {
        // Set a simple cookie for auth
        if (typeof window !== 'undefined') {
          document.cookie = 'tier_d_auth_token=demo-token; path=/; max-age=86400;';
        }
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '2rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
            Admin Login
          </h1>
          <p style={{ color: '#666' }}>Sign in to access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '0.75rem', 
              borderRadius: '5px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="username" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                borderRadius: '5px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                borderRadius: '5px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <Link 
              href="/"
              style={{ 
                color: '#0070f3', 
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              Back to Home
            </Link>
          </div>
        </form>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
        <p>Default credentials: admin / Tier-dAdmin2024!</p>
        <p>For demo purposes only.</p>
      </div>
    </div>
  );
} 