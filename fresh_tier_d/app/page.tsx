import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  emoji: string;
}

function FeatureCard({ title, description, emoji }: FeatureCardProps) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem' 
      }}>
        {emoji}
      </div>
      
      <h3 style={{ 
        fontSize: '1.2rem',
        margin: '0 0 0.5rem',
        color: '#333'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        fontSize: '0.9rem',
        color: '#666',
        margin: 0,
        lineHeight: 1.6
      }}>
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          color: '#0070f3'
        }}>
          Tier'd
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#666', 
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Product ranking platform with real-time features and analytics dashboard
        </p>
      </header>
      
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '2rem', 
        borderRadius: '10px',
        border: '1px solid #bae6fd',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginTop: 0,
          marginBottom: '1rem',
          color: '#0369a1'
        }}>
          Deployment Successful! 🎉
        </h2>
        
        <p style={{ margin: 0, color: '#0c4a6e' }}>
          Your Tier'd application is now live and ready to use.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <FeatureCard
          title="Real-time Voting"
          description="Cast your vote on products and see results instantly update across all connected users."
          emoji="📊"
        />
        
        <FeatureCard
          title="Product Rankings"
          description="Browse products ranked by user votes, with support for filtering by category."
          emoji="🏆"
        />
        
        <FeatureCard
          title="Admin Dashboard"
          description="Access detailed analytics and insights on product performance and user activity."
          emoji="📈"
        />
      </div>
      
      <p style={{ 
        textAlign: 'center',
        marginTop: '3rem',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        Tier'd Application • Product Ranking Platform
      </p>
    </div>
  );
} 