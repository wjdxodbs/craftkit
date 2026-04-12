import type { ReactNode } from 'react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'

const COLLAPSED_WIDTH = 56

export default function ToolsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Placeholder - 항상 56px 공간 차지 */}
      <div className="shrink-0" style={{ width: COLLAPSED_WIDTH }} />
      {/* Sidebar - absolute로 위에 떠서 오버레이 */}
      <Sidebar />
      <main
        className="flex min-w-0 flex-1 flex-col"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(167,139,250,0.08) 0%, var(--background) 65%)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
