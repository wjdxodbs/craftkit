'use client'
import { motion } from 'motion/react'
import { ToolCard } from '@/widgets/tool-card/ui/ToolCard'
import { TOOLS } from '@/shared/config/tools'

const COMING_SOON_COUNT = 2

export function HomeView() {
  return (
    <main
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.3 0.08 73 / 0.2) 0%, var(--background) 65%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <span className="font-heading text-sm font-bold tracking-widest text-white">
          CRAFTKIT
        </span>
      </nav>

      {/* Hero */}
      <div className="px-6 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-heading text-4xl font-bold leading-[1.15] text-white sm:text-5xl"
        >
          누구나 쓸 수 있는
          <br />
          심플한 웹 도구
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-sm text-white/50"
        >
          가입 없이, 업로드 없이. 브라우저에서 바로.
        </motion.p>
      </div>

      {/* Tool Grid */}
      <div className="mx-auto max-w-2xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
          {Array.from({ length: COMING_SOON_COUNT }).map((_, i) => (
            <motion.div
              key={`coming-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * (TOOLS.length + i) }}
            >
              <div className="rounded-xl border border-dashed border-white/10 p-4 opacity-30">
                <div className="mb-3 h-8 w-8 rounded-lg bg-white/5" />
                <p className="text-xs text-white/20">준비 중...</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
