import { Brain } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="p-4 bg-primary/10 rounded-full animate-pulse">
            <Brain className="h-12 w-12 text-primary animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Loading MVP Studio</h2>
          <p className="text-muted-foreground">Preparing your AI-powered build orchestrator...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}
