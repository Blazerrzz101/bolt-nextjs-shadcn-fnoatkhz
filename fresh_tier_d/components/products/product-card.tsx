import React from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
  imageUrl: string;
}

export default function ProductCard({
  id,
  name,
  description,
  category,
  upvotes,
  downvotes,
  score,
  imageUrl
}: ProductCardProps) {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      margin: '16px 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        height: '180px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img 
          src={imageUrl || 'https://placehold.co/300x200/e4f2ff/003366?text=Product'} 
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          backgroundColor: '#0ea5e9',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {category}
        </div>
      </div>
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#1e293b'
        }}>
          {name}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '16px',
          flexGrow: 1
        }}>
          {description.length > 100 ? description.substring(0, 100) + '...' : description}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#f1f5f9',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#475569'
            }}>
              ↑ {upvotes}
            </span>
            <span style={{
              backgroundColor: '#f1f5f9',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#475569'
            }}>
              ↓ {downvotes}
            </span>
          </div>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            color: score > 0 ? '#16a34a' : score < 0 ? '#dc2626' : '#64748b'
          }}>
            {score > 0 ? '+' : ''}{score}
          </div>
        </div>
      </div>
    </div>
  );
} 