'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { TOOLS } from '@/shared/config/tools'
import { cn } from '@/shared/lib/utils'

const EXPANDED_WIDTH = 220
const COLLAPSED_WIDTH = 56

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()

  return (
    <motion.nav
      initial={false}
      animate={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden' }}
      className="relative flex shrink-0 flex-col border-r border-white/10 bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/10 px-3">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-black text-primary-foreground">
            CK
          </span>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap text-sm font-bold tracking-widest text-white font-heading"
              >
                CRAFTKIT
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Tool List */}
      <ul className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
        {TOOLS.filter((t) => t.available).map((tool) => {
          const isActive = pathname === tool.href
          return (
            <li key={tool.id}>
              <Link
                href={tool.href}
                aria-label={!isExpanded ? tool.name : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-9 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-primary" />
                )}
                <span className="flex size-[22px] shrink-0 items-center justify-center text-base leading-none">
                  {tool.icon}
                </span>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.span
                      key={`label-${tool.id}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.12 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {tool.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className={cn(
            'flex h-9 w-full cursor-pointer items-center rounded-lg px-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white/60',
            isExpanded ? 'justify-start gap-3' : 'justify-center'
          )}
        >
          <svg
            className={cn('size-4 shrink-0 transition-transform duration-200', !isExpanded && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.12 }}
                className="overflow-hidden whitespace-nowrap text-xs"
              >
                접기
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.nav>
  )
}
