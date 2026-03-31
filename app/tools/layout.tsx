import type { ReactNode } from 'react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'

export default function ToolsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        {children}
      </main>
    </div>
  )
}
