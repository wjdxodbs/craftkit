'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import { TOOLS } from '@/shared/config/tools'

const COMING_SOON_COUNT = 2

export function HomeView() {
  const availableCount = TOOLS.filter((t) => t.available).length

  return (
    <main
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.3 0.08 73 / 0.2) 0%, var(--background) 65%)',
      }}
    >
      {/* Noise texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-black text-primary-foreground">
            CK
          </span>
          <span className="font-heading text-sm font-bold tracking-widest text-white">
            CRAFTKIT
          </span>
        </div>
        <span className="text-xs text-foreground/25">{availableCount} tools</span>
      </nav>

      <div className="mx-auto max-w-2xl px-6">
        {/* Poster Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pb-8 pt-12"
        >
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
            Web Tools
          </p>
          <h1 className="font-heading text-[52px] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[72px] md:text-[90px]">
            CRAFT
            <br />
            <span className="text-primary">KIT</span>
          </h1>
        </motion.div>

        {/* Amber rule */}
        <div className="h-[3px] bg-primary" />

        {/* 카테고리 필터 바 자리 — 도구 10개 초과 시 여기에 추가 */}

        {/* Tool List */}
        <div className="pb-16">
          {TOOLS.map((tool, i) =>
            tool.available ? (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <Link href={tool.href}>
                  <div className="group flex cursor-pointer items-center gap-4 border-b border-white/5 py-[18px] transition-colors hover:bg-white/[0.02]">
                    <div className="flex-1">
                      <p className="text-sm font-bold tracking-tight text-slate-200 transition-colors group-hover:text-white">
                        {tool.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded px-[7px] py-0.5 text-[9px] font-semibold"
                            style={{
                              background: tool.tagBg,
                              color: tool.tagText,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-white/20 transition-colors group-hover:text-white/50">
                        ↗
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="flex items-center border-b border-white/5 py-[18px] opacity-30">
                  <p className="text-xs text-white/20">준비 중...</p>
                </div>
              </motion.div>
            )
          )}
          {Array.from({ length: COMING_SOON_COUNT }).map((_, i) => (
            <motion.div
              key={`coming-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * (TOOLS.length + i) }}
            >
              <div className="flex items-center border-b border-white/5 py-[18px] opacity-30">
                <p className="text-xs text-white/20">준비 중...</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
