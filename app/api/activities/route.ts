import { NextRequest, NextResponse } from "next/server"
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Activity {
  id: string
  type: "vote" | "comment" | "review"
  action: "upvote" | "downvote" | "comment" | "review"
  productId: string
  productName: string
  timestamp: string
  details?: string
  userId: string
}

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: "act-1",
    type: "vote",
    action: "upvote",
    productId: "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
    productName: "ASUS ROG Swift PG279QM",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    userId: "anonymous"
  },
  {
    id: "act-2",
    type: "vote",
    action: "downvote",
    productId: "c8d9e0f1-2a3b-4c5d-6e7f-8g9h0i1j2k3l",
    productName: "Razer DeathAdder V2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: "anonymous"
  },
  {
    id: "act-3",
    type: "comment",
    action: "comment",
    productId: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    productName: "Logitech G Pro X Superlight",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    details: "This is the best mouse I've ever used!",
    userId: "anonymous"
  }
];

const DATA_DIR = path.resolve(process.cwd(), 'data')
const ACTIVITIES_FILE = path.resolve(DATA_DIR, 'activities.json')

// Initialize activities file if it doesn't exist
async function ensureActivitiesFile() {
  if (!existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(ACTIVITIES_FILE)) {
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify({ activities: mockActivities }), 'utf8')
  }
}

// Get activities from file
async function getActivities(): Promise<Activity[]> {
  try {
    await ensureActivitiesFile()
    const data = await fs.readFile(ACTIVITIES_FILE, 'utf8')
    const parsed = JSON.parse(data)
    
    // Handle both formats: object with activities array or direct array
    const activities = Array.isArray(parsed) ? parsed : (parsed.activities || [])
    return activities
  } catch (error) {
    console.error('Error reading activities:', error)
    // Return mock data as fallback
    return mockActivities
  }
}

// Save activity to file
export async function saveActivity(activity: Activity) {
  try {
    await ensureActivitiesFile()
    const activities = await getActivities()
    activities.unshift(activity) // Add new activity at the beginning
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify({ activities }, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error saving activity:', error)
    return false
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Get activities - if userId is provided, filter by it
    const activities = await getActivities()
    const filteredActivities = userId 
      ? activities.filter(activity => activity.userId === userId)
      : activities
    
    // Return activities directly as an array
    return NextResponse.json(filteredActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    // Return empty array on error
    return NextResponse.json([])
  }
} 