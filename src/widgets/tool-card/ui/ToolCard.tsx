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
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link href={tool.href}>
        <div
          className="cursor-pointer rounded-xl p-4 transition-colors bg-card"
          style={{
            border: `1px solid ${tool.borderColor}`,
          }}
        >
          <div
            className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-base"
            style={{
              background: tool.accentColor,
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
                  border: `1px solid ${tool.borderColor}`,
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
