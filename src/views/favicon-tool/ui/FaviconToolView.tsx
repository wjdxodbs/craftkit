'use client'
import { FaviconGenerator } from '@/widgets/favicon-generator/ui/FaviconGenerator'

export function FaviconToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-slate-200">
        Favicon Generator
      </h1>
      <FaviconGenerator />
    </div>
  )
}
