export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a test page to verify the build process.</p>
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Build information</h2>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Static build mode: Yes</p>
      </div>
    </div>
  )
} 