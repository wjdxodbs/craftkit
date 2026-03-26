'use client'
import Link from 'next/link'
import { OgImageGenerator } from '@/widgets/og-image-generator/ui/OgImageGenerator'

export function OgImageToolView() {
  return (
    <main className="min-h-screen bg-[#0d0d1a]">
      <nav className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
        <Link
          href="/"
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          CRAFTKIT
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-xs text-blue-400">OG Image Generator</span>
      </nav>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold text-slate-200">
          OG Image Generator
        </h1>
        <OgImageGenerator />
      </div>
    </main>
  )
}
