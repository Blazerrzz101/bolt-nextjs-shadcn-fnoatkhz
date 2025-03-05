import { AuthStatusDebug } from "../auth-status"

export const metadata = {
  title: "Authentication Debug",
  description: "Debug the authentication state and localStorage data",
}

export default function AuthDebugPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Authentication Debug</h1>
      <p className="text-muted-foreground mb-8">
        This page displays detailed information about the current authentication state and localStorage data for debugging.
      </p>
      
      <AuthStatusDebug />
    </div>
  )
} 