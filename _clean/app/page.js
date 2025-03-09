export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Tier'd Application - Clean Build</h1>
      <p>Deployment successful with real-time features and CMS analytics!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul>
          <li>Real-time voting and reviews</li>
          <li>CMS analytics dashboard</li>
          <li>Mock mode for development and testing</li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          <a href="/dashboard" style={{ color: 'blue', textDecoration: 'underline' }}>
            View Analytics Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
