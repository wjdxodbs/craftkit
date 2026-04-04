"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { TOOLS } from "@/shared/config/tools";

const availableCount = TOOLS.filter((t) => t.available).length;

export function HomeView() {
  return (
    <main
      className="relative min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 45% at 50% -5%, oklch(0.3 0.08 73 / 0.2) 0%, var(--background) 65%)",
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

      {/* Poster Header — 풀 와이드 */}
      <div className="px-6 sm:px-10 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pb-8 pt-12"
        >
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
            Web Tools · {availableCount} tools
          </p>
          <h1 className="font-heading text-[36px] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[72px] md:text-[90px]">
            CRAFT
            <br />
            <span className="text-primary">KIT</span>
          </h1>
        </motion.div>
      </div>

      {/* Amber rule — 풀 와이드 */}
      <div className="h-[3px] bg-primary" />

      {/* Tool List — 풀 와이드 */}
      <div>
        {/* 카테고리 필터 바 자리 — 도구 10개 초과 시 여기에 추가 */}
        <div className="pb-16">
          {TOOLS.filter((tool) => tool.available).map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <Link
                href={tool.href}
                className="group flex items-center gap-4 border-b border-white/5 px-6 py-[14px] transition-colors hover:bg-white/[0.02] sm:px-10 sm:py-[18px] md:px-16 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-base font-bold tracking-tight text-slate-200 transition-colors group-hover:text-white sm:text-lg">
                    {tool.name}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40 sm:text-sm">
                    {tool.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <div className="hidden flex-wrap gap-1 sm:flex">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:py-1 sm:text-[11px]"
                        style={{
                          background: tool.tagBg,
                          color: tool.tagText,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-sm text-white/20 transition-colors group-hover:text-white/50"
                  >
                    ↗
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
