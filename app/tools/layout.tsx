import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0d0d1a]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
