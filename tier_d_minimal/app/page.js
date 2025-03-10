import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#0070f3', fontSize: '2.5rem', marginBottom: '1rem' }}>Tier'd</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          Welcome to Tier'd - the platform where users vote on their favorite products across multiple categories.
          Discover top-rated items and share your opinion through our real-time voting system.
        </p>
      </header>

      <div style={{ 
        background: 'linear-gradient(to right, #e6f7ff, #f0f9ff)', 
        padding: '2rem', 
        borderRadius: '10px', 
        marginBottom: '2rem', 
        textAlign: 'center' 
      }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem' }}>Featured Products</h2>
        <p>These products are ranked by user votes. Click on any product to learn more or cast your vote!</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Product cards - these would normally be loaded from an API */}
        <ProductCard 
          id="prod_8"
          name="Smart Fitness Watch"
          description="Track your workouts, heart rate, sleep, and more with our advanced fitness watch."
          image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?fit=crop&w=300&h=200"
          upvotes={31}
          downvotes={4}
          category="fitness"
        />
        <ProductCard 
          id="prod_6"
          name="Ultra HD Smart TV"
          description="65-inch Ultra HD Smart TV with HDR and built-in streaming apps."
          image="https://images.unsplash.com/photo-1593784991095-a205069470b6?fit=crop&w=300&h=200"
          upvotes={25}
          downvotes={6}
          category="electronics"
        />
        <ProductCard 
          id="prod_12"
          name="Bluetooth Wireless Earbuds"
          description="True wireless earbuds with 30-hour battery life and premium sound quality."
          image="https://images.unsplash.com/photo-1606220838315-056192d5e927?fit=crop&w=300&h=200"
          upvotes={21}
          downvotes={3}
          category="audio"
        />
        <ProductCard 
          id="prod_2"
          name="Smart Home Assistant Hub"
          description="Control your entire home with our voice-activated smart hub."
          image="https://images.unsplash.com/photo-1546054454-aa26e2b734c7?fit=crop&w=300&h=200"
          upvotes={22}
          downvotes={5}
          category="electronics"
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Link 
          href="/products" 
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: 'bold',
            borderRadius: '5px',
            boxShadow: '0 4px 14px rgba(0, 118, 255, 0.39)'
          }}
        >
          View All Products
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <FeatureCard 
          title="Real-time Voting"
          description="Cast your vote and see results update instantly. Upvote products you love or downvote those that don't meet expectations."
          icon="📊"
        />
        <FeatureCard 
          title="Product Rankings"
          description="Browse products ranked by user votes. Find the best items in each category based on community feedback."
          icon="🏆"
        />
        <FeatureCard 
          title="Admin Dashboard"
          description="Our analytics dashboard provides insights into product performance, voting patterns, and user trends."
          icon="📈"
        />
      </div>

      <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #eaeaea', color: '#666' }}>
        <p>Tier'd - Product ranking platform with real-time features</p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/admin/login" style={{ color: '#0070f3', marginRight: '1rem', textDecoration: 'none' }}>Admin</Link>
          <Link href="/api/health-check" style={{ color: '#0070f3', textDecoration: 'none' }}>API Status</Link>
        </div>
      </footer>
    </div>
  );
}

// Product card component
function ProductCard({ id, name, description, image, upvotes, downvotes, category }) {
  const score = upvotes - downvotes;
  
  return (
    <div style={{ 
      border: '1px solid #eaeaea', 
      borderRadius: '10px', 
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ 
        height: '160px', 
        overflow: 'hidden', 
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {image && (
          <img 
            src={image} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        )}
      </div>
      
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'inline-block', 
          fontSize: '0.75rem', 
          backgroundColor: '#e6f7ff', 
          color: '#0369a1',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          marginBottom: '0.5rem'
        }}>
          {category}
        </div>
        
        <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem', color: '#333' }}>{name}</h3>
        
        <p style={{ 
          margin: '0.5rem 0 1rem', 
          fontSize: '0.9rem', 
          color: '#666',
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: '1rem',
          padding: '0.5rem 0',
          borderTop: '1px solid #eaeaea'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'flex',
              alignItems: 'center',
              marginRight: '1rem',
              color: score > 0 ? '#16a34a' : score < 0 ? '#dc2626' : '#666'
            }}>
              {score > 0 ? '↑' : score < 0 ? '↓' : '•'}
              <span style={{ marginLeft: '0.25rem', fontWeight: 'bold' }}>{Math.abs(score)}</span>
            </span>
            
            <span style={{ fontSize: '0.85rem', color: '#666' }}>
              {upvotes} up · {downvotes} down
            </span>
          </div>
          
          <Link 
            href={`/products/${id}`}
            style={{ 
              color: '#0070f3', 
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ title, description, icon }) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      border: '1px solid #eaeaea',
      borderRadius: '10px',
      padding: '1.5rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#333' }}>{title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>{description}</p>
    </div>
  );
} 