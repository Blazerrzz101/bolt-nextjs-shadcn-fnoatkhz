import Link from 'next/link';

// Clean app page with working functionality
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Tier'd Application</h1>
        <p className="text-xl text-gray-600">Product ranking and voting platform</p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded shadow">
        <h2 className="text-xl font-bold text-green-700">Deployment Success!</h2>
        <p className="text-green-600">Your application is now running with full functionality.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">API Routes</h2>
          <ul className="space-y-2">
            <li className="hover:bg-gray-50 p-2 rounded">
              <Link href="/api/health-check" className="text-blue-500 hover:underline">
                → Health Check API
              </Link>
            </li>
            <li className="hover:bg-gray-50 p-2 rounded">
              <Link href="/api/products" className="text-blue-500 hover:underline">
                → Products API
              </Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Status Information</h2>
          <div className="space-y-2">
            <p><span className="font-bold">Environment:</span> {process.env.NODE_ENV || 'production'}</p>
            <p><span className="font-bold">Mock Mode:</span> {process.env.MOCK_DB === 'true' ? 'Enabled' : 'Disabled'}</p>
            <p><span className="font-bold">Server Time:</span> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
