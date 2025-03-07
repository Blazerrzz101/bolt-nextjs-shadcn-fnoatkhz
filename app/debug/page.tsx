"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ApiTest {
  name: string
  endpoint: string
  description: string
  status: 'success' | 'error' | 'pending'
  data: any
}

export default function DebugPage() {
  const [tests, setTests] = useState<ApiTest[]>([
    {
      name: 'Products API',
      endpoint: '/api/products',
      description: 'Fetches all products',
      status: 'pending',
      data: null
    },
    {
      name: 'Product Detail',
      endpoint: '/api/products/product?id=a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      description: 'Fetches a specific product by ID',
      status: 'pending',
      data: null
    },
    {
      name: 'Votes API',
      endpoint: '/api/vote?productId=a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6&clientId=debug-test',
      description: 'Checks vote status for a product',
      status: 'pending',
      data: null
    },
    {
      name: 'Notifications API',
      endpoint: '/api/notifications',
      description: 'Fetches notifications',
      status: 'pending',
      data: null
    },
    {
      name: 'Activities API',
      endpoint: '/api/activities',
      description: 'Fetches user activities',
      status: 'pending',
      data: null
    }
  ])

  const testAllApis = async () => {
    // Reset all tests to pending
    setTests(current => 
      current.map(test => ({ ...test, status: 'pending', data: null }))
    )
    
    // Run tests sequentially to avoid rate limiting
    const updatedTests = [...tests]
    
    for (let i = 0; i < updatedTests.length; i++) {
      try {
        const test = updatedTests[i]
        console.log(`Testing ${test.name}: ${test.endpoint}`)
        
        const response = await fetch(test.endpoint, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Status: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        updatedTests[i] = { 
          ...test, 
          status: 'success', 
          data: Array.isArray(data) ? 
            `Array with ${data.length} items` : 
            JSON.stringify(data, null, 2).substring(0, 100) + '...'
        }
      } catch (error) {
        console.error(`Error testing ${updatedTests[i].name}:`, error)
        updatedTests[i] = { 
          ...updatedTests[i], 
          status: 'error', 
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      }
      
      // Update state after each test
      setTests([...updatedTests])
    }
  }
  
  // Automatically run tests on page load
  useEffect(() => {
    testAllApis()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">API Debug Page</h1>
      
      <div className="flex justify-center mb-6">
        <Button onClick={testAllApis} className="px-6 py-4 text-lg">
          Run All Tests
        </Button>
      </div>
      
      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{test.name}</h3>
              <div className={`px-3 py-1 rounded text-sm ${
                test.status === 'success' ? 'bg-green-100 text-green-800' :
                test.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {test.status.toUpperCase()}
              </div>
            </div>
            <p className="mb-2 text-gray-600">{test.description}</p>
            <div className="text-sm text-gray-500 mb-2">Endpoint: {test.endpoint}</div>
            <div className="p-3 bg-gray-100 rounded overflow-auto max-h-40">
              {test.status === 'pending' ? (
                <p>Testing...</p>
              ) : (
                <pre>{JSON.stringify(test.data, null, 2)}</pre>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 