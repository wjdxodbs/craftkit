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
      <main
        className="flex min-w-0 flex-1 flex-col"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.3 0.08 73 / 0.2) 0%, var(--background) 65%)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
