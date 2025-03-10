'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="bg-blue-500 w-full text-white">
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Tier&apos;d</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Product ranking platform with real-time features and analytics dashboard
          </p>
        </div>
      </div>

      <section className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 text-blue-700 inline-block py-2 px-4 rounded-full text-sm font-semibold mb-4">
              Deployment Successful! 🎉
            </div>
            <h2 className="text-2xl font-bold">Your Tier&apos;d application is now live and ready to use.</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
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

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <button 
            onClick={() => router.push('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-200"
          >
            Browse Products
          </button>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-200"
          >
            Admin Login
          </button>
        </div>
      </section>

      <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="container mx-auto py-6 px-4 text-center text-gray-600">
          <p>Tier&apos;d Application • Product Ranking Platform</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, emoji }: { title: string; description: string; emoji: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 