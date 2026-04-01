'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { Tool } from '@/shared/config/tools'

interface Props {
  tool: Tool
}

export function ToolCard({ tool }: Props) {
  if (!tool.available) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-4 opacity-40">
        <div className="mb-3 h-8 w-8 rounded-lg bg-white/[0.08]" />
        <p className="text-xs text-white/20">Coming soon...</p>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ '--glow': tool.accentColor + '55' } as React.CSSProperties}
    >
      <Link href={tool.href}>
        <div
          className="relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-card p-4 transition-shadow hover:shadow-[0_0_20px_var(--glow)]"
        >
          {/* 상단 컬러바 */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${tool.accentColor}, ${tool.accentColor}33)`,
            }}
          />
          <div
            className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-base"
            style={{
              background: `${tool.accentColor}20`,
            }}
          >
            {tool.icon}
          </div>
          <p className="text-sm font-semibold text-slate-200">{tool.name}</p>
          <p className="mt-1 text-xs text-white/50">{tool.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{
                  background: tool.tagBg,
                  color: tool.tagText,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
