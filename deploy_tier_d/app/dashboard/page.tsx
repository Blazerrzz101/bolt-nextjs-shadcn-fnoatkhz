"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'
import { Product } from '@/types/product'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Activity, ArrowUpCircle, ArrowDownCircle, BarChart2 } from 'lucide-react'

// Dynamically import recharts components to avoid SSR issues
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
)
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
)

// Define types for chart data
interface ChartDataItem {
  name: string
  upvotes: number
  downvotes: number
  score: number
}

interface PieChartItem {
  name: string
  value: number
}

// Define types for the label props
interface PieLabelProps {
  name: string
  percent: number
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    // Fetch products and activities when component mounts
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch products
        const productsResponse = await fetch('/api/products')
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await productsResponse.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
        
        // Fetch activities
        const activitiesResponse = await fetch('/api/activities')
        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch activities')
        }
        const activitiesData = await activitiesResponse.json()
        setActivities(Array.isArray(activitiesData) ? activitiesData : [])
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Prepare data for charts
  const votesData: ChartDataItem[] = products.map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    upvotes: product.upvotes || 0,
    downvotes: product.downvotes || 0,
    score: (product.upvotes || 0) - (product.downvotes || 0)
  }))
  
  // Sort by score for ranking chart
  const rankingData = [...votesData].sort((a, b) => b.score - a.score)
  
  // Prepare category distribution data
  const categoryMap = products.reduce((acc, product) => {
    const category = product.category || 'unknown'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const categoryData: PieChartItem[] = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }))
  
  // Prepare activity data
  const activityTypeMap = activities.reduce((acc, activity) => {
    const type = activity.action || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const activityData: PieChartItem[] = Object.entries(activityTypeMap).map(([name, value]) => ({
    name,
    value
  }))
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Custom label renderer for pie charts
  const renderCustomLabel = ({ name, percent }: PieLabelProps) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`
  }
  
  if (loading) {
    return (
      <div className="container py-10 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[150px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-destructive text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Calculate total stats
  const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0)
  const totalDownvotes = products.reduce((sum, product) => sum + (product.downvotes || 0), 0)
  const totalScore = totalUpvotes - totalDownvotes
  const totalProducts = products.length
  const totalActivities = activities.length
  
  // Get top product by score
  const topProduct = products.length 
    ? products.reduce((top, product) => {
        const currentScore = (product.upvotes || 0) - (product.downvotes || 0)
        const topScore = (top.upvotes || 0) - (top.downvotes || 0)
        return currentScore > topScore ? product : top
      }, products[0])
    : null
  
  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="px-3 py-1">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalProducts}</div>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUpvotes}</div>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Downvotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalDownvotes}</div>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalActivities}</div>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Product Card */}
      {topProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Top Ranked Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="bg-muted rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                <span className="text-2xl font-bold">#{1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{topProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{topProduct.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <ArrowUpCircle className="h-3 w-3" /> {topProduct.upvotes || 0}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <ArrowDownCircle className="h-3 w-3" /> {topProduct.downvotes || 0}
                  </Badge>
                  <Badge className="bg-primary">{topProduct.category}</Badge>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <span className="text-3xl font-bold text-primary">
                  {(topProduct.upvotes || 0) - (topProduct.downvotes || 0)}
                </span>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chart Tabs */}
      <Tabs defaultValue="votes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="votes">Vote Distribution</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="votes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution by Product</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={votesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 100,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="upvotes" fill="#4ade80" name="Upvotes" />
                  <Bar dataKey="downvotes" fill="#f87171" name="Downvotes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Rankings by Score</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankingData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 100,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}