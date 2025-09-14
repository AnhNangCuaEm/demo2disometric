import Link from 'next/link';

export default function Home() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏮 Japonism Festival</h1>
        <p>Welcome to the interactive festival experience!</p>
      </div>
      
      <div className="dashboard-grid">
        <Link href="/venue" className="dashboard-card">
          <h2>🗾 Festival Venue</h2>
          <p>Explore the interactive festival map with Phaser 3</p>
        </Link>
        
        <Link href="/controller" className="dashboard-card">
          <h2>🎮 Controller</h2>
          <p>Mobile-friendly controller for navigation</p>
        </Link>
        
        <Link href="/dashboard" className="dashboard-card">
          <h2>📊 Dashboard</h2>
          <p>Real-time player statistics and monitoring</p>
        </Link>
      </div>
      
      <div className="getting-started">
        <h2>Getting Started</h2>
        <ol>
          <li>Make sure the server is running: <code>npm run server</code></li>
          <li>Visit the <strong>Venue</strong> to see the festival map</li>
          <li>Use the <strong>Controller</strong> on mobile for navigation</li>
          <li>Monitor activity on the <strong>Dashboard</strong></li>
        </ol>
      </div>
    </div>
  );
}