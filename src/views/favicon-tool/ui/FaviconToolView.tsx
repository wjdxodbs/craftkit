import { FaviconGenerator } from '@/widgets/favicon-generator/ui/FaviconGenerator'

export function FaviconToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 border-l-2 border-amber-500/60 pl-3 text-2xl font-bold text-foreground">
        Favicon Generator
      </h1>
      <FaviconGenerator />
    </div>
  )
}
