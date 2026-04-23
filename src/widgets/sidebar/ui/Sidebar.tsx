"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { TOOLS } from "@/shared/config/tools";
import { cn } from "@/shared/lib/utils";

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <motion.nav
      initial={false}
      animate={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/15 bg-sidebar shadow-[4px_0_24px_rgba(0,0,0,0.3)]"
    >
      {/* Noise texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

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
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap text-sm font-bold tracking-widest text-white"
              >
                CRAFTKIT
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Tool List */}
      <ul className="flex flex-1 flex-col gap-1 p-2">
        {TOOLS.filter((t) => t.available).map((tool) => {
          const isActive = pathname === tool.href;
          return (
            <li key={tool.id}>
              <Link
                href={tool.href}
                aria-label={!isExpanded ? tool.name : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group/link relative flex h-9 cursor-pointer items-center rounded-lg text-sm transition-colors",
                  isActive
                    ? ""
                    : "text-white/50 hover:bg-white/5 hover:text-white/70",
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: `${tool.accentColor}15`,
                        color: tool.accentColor,
                      }
                    : undefined
                }
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r"
                    style={{ backgroundColor: tool.accentColor }}
                  />
                )}
                <span className="flex w-10 shrink-0 items-center justify-center">
                  {(() => {
                    const Icon = tool.icon;
                    return <Icon className="size-4 shrink-0" />;
                  })()}
                </span>
                {!isExpanded && (
                  <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md border border-white/10 bg-[#111111] px-2.5 py-1.5 text-xs text-white/80 opacity-0 shadow-lg transition-opacity group-hover/link:opacity-100">
                    {tool.name}
                  </span>
                )}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.span
                      key={`label-${tool.id}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
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
          );
        })}
      </ul>

      {/* Expand Toggle */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-9 w-full cursor-pointer items-center overflow-hidden rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
        >
          <span className="flex w-10 shrink-0 items-center justify-center">
            <svg
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                !isExpanded && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </span>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
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
  );
}
