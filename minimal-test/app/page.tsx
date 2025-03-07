export default function MinimalTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Test Page</h1>
      <p className="mb-4">This is a minimal test page with no dependencies on Supabase.</p>
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Environment Information</h2>
        <p>Node.js environment: {process.env.NODE_ENV}</p>
        <p>Static build: {process.env.NEXT_STATIC_EXPORT ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
