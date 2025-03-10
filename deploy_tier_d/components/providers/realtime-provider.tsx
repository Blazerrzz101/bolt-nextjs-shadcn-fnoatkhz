"use client"

import { useProductUpdates } from '@/hooks/use-realtime-updates'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useProductUpdates()
  return <>{children}</>
}