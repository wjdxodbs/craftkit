"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Globe, Share2, Scaling, Crop, Palette } from "lucide-react";
import { TOOLS } from "@/shared/config/tools";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Share2,
  Scaling,
  Crop,
  Palette,
};

const MotionLink = motion.create(Link);

const availableCount = TOOLS.filter((t) => t.available).length;

export function HomeView() {
  return (
    <main className="relative min-h-screen bg-[#050505]">
      {/* Aurora background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[-220px] -translate-x-1/2"
        style={{ width: 1200, height: 500 }}
      >
        <div
          className="absolute left-[10%] top-0 rounded-full"
          style={{
            width: 500,
            height: 400,
            background: "#7c3aed",
            filter: "blur(130px)",
            opacity: 0.09,
            animation: "aurora-drift 16s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute left-[40%] top-[50px] rounded-full"
          style={{
            width: 400,
            height: 350,
            background: "#a78bfa",
            filter: "blur(130px)",
            opacity: 0.09,
            animation: "aurora-drift 16s ease-in-out infinite alternate",
            animationDelay: "-5s",
          }}
        />
        <div
          className="absolute right-[10%] top-[30px] rounded-full"
          style={{
            width: 350,
            height: 300,
            background: "#6d28d9",
            filter: "blur(130px)",
            opacity: 0.09,
            animation: "aurora-drift 16s ease-in-out infinite alternate",
            animationDelay: "-10s",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[960px] px-6 pb-16 pt-16 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.08em] text-[#a78bfa]/55">
            {availableCount} tools
          </p>
          <h1
            className="text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl md:text-[56px]"
            style={{
              background: "linear-gradient(135deg, #fafafa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: "1.05",
            }}
          >
            Craftkit
          </h1>
          <p className="mt-2.5 text-base text-[#555]">
            Browser-based tools for developers
          </p>
          <div
            className="mt-9"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, #a78bfa38, #a78bfa18, transparent)",
            }}
          />
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {TOOLS.filter((tool) => tool.available).map((tool, i) => {
            const Icon = ICON_MAP[tool.icon];
            return (
              <MotionLink
                key={tool.id}
                href={tool.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="group relative overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-5 transition-[border-color,box-shadow] duration-300 hover:border-[#a78bfa22] hover:shadow-[0_8px_32px_-8px_#a78bfa14]"
              >
                {/* Gradient border glow */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  style={{
                    padding: 1,
                    background:
                      "linear-gradient(135deg, #a78bfa50, #7c3aed30, #a78bfa20)",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                  }}
                />

                {/* Inner glow */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-1/2 -top-1/2 h-[200%] w-[200%] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #a78bfa08 0%, transparent 60%)",
                  }}
                />

                {/* Arrow */}
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-5 text-sm text-[#444] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#a78bfa]"
                >
                  ↗
                </span>

                {/* Icon */}
                <div
                  className="relative z-10 mb-4 flex size-10 items-center justify-center rounded-[10px] border border-[#a78bfa22]"
                  style={{
                    background:
                      "linear-gradient(135deg, #a78bfa15 0%, #7c3aed0a 100%)",
                  }}
                >
                  {Icon && (
                    <Icon className="size-4 text-[#a78bfa]" />
                  )}
                </div>

                {/* Text */}
                <p className="relative z-10 mb-1 text-sm font-semibold text-[#fafafa]">
                  {tool.name}
                </p>
                <p className="relative z-10 mb-4 text-xs leading-relaxed text-[#777]">
                  {tool.description}
                </p>

                {/* Tags */}
                <div className="relative z-10 flex flex-wrap gap-[5px]">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#a78bfa14] bg-[#a78bfa0c] px-2 py-0.5 font-mono text-[10px] font-medium text-[#a78bfa]/55"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionLink>
            );
          })}
        </div>
      </div>
    </main>
  );
}
