"use client";
import { motion } from "motion/react";
import { Button } from "@/shared/ui/button";

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
      <Button
        variant="primary-outline"
        size="full"
        onClick={onClick}
        disabled={disabled}
      >
        {isProcessing ? processingText : children}
      </Button>
    </motion.div>
  );
}
