export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Tier'd Application</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center', marginBottom: '2rem' }}>
        This is the Tier'd application, a platform for ranking and voting on products.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', width: '100%' }}>
        <h2>Available API Endpoints:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '12px', background: '#f4f4f4', borderRadius: '8px', marginBottom: '8px' }}>
            <strong>GET /api/health-check</strong> - Check system status
          </li>
          <li style={{ padding: '12px', background: '#f4f4f4', borderRadius: '8px', marginBottom: '8px' }}>
            <strong>GET /api/products</strong> - List all products
          </li>
          <li style={{ padding: '12px', background: '#f4f4f4', borderRadius: '8px', marginBottom: '8px' }}>
            <strong>GET /api/vote?productId=1&clientId=123</strong> - Get vote status
          </li>
          <li style={{ padding: '12px', background: '#f4f4f4', borderRadius: '8px', marginBottom: '8px' }}>
            <strong>POST /api/vote</strong> - Submit a vote
          </li>
        </ul>

        <h2>Features:</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '16px', background: '#edf2ff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Product Listing</h3>
            <p>Browse and search through products</p>
          </div>
          <div style={{ padding: '16px', background: '#fff4e6', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Voting System</h3>
            <p>Upvote or downvote products</p>
          </div>
          <div style={{ padding: '16px', background: '#e6fcf5', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Categories</h3>
            <p>Browse products by category</p>
          </div>
          <div style={{ padding: '16px', background: '#f3f0ff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Mock Data</h3>
            <p>Functional product data for testing</p>
          </div>
        </div>
      </div>
    </div>
  );
} 