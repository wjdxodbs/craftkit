import type { ReactNode } from 'react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'

export default function ToolsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#111110]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-[#191917]">
        <div className="h-14 border-b border-white/10" />
        {children}
      </main>
    </div>
  )
}
