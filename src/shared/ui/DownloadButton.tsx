"use client";
import { motion } from "motion/react";

const cls =
  "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-40";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  processingText?: string;
  children: React.ReactNode;
}

export function DownloadButton({
  onClick,
  disabled,
  isProcessing = false,
  processingText = "처리 중…",
  children,
}: Props) {
  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <button onClick={onClick} disabled={disabled} className={cls}>
        {isProcessing ? processingText : children}
      </button>
    </motion.div>
  );
}
