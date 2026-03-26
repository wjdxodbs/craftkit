'use client'
import { OgImageGenerator } from '@/widgets/og-image-generator/ui/OgImageGenerator'

export function OgImageToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-slate-200">
        OG Image Generator
      </h1>
      <OgImageGenerator />
    </div>
  )
}
