"use client";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/shared/lib/utils";

interface Props {
  onFileLoad?: (img: HTMLImageElement, dataUrl: string, file: File) => void;
  onFiles?: (files: File[]) => void;
  onError?: () => void;
  accept?: string;
  hint?: string;
  multiple?: boolean;
  variant?: "dashed" | "solid";
  size?: "sm" | "lg" | "xl";
}

export function ImageUpload({
  onFileLoad,
  onFiles,
  onError,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp",
  hint = "PNG, JPG, SVG, WebP — 권장: 512×512 이상",
  multiple,
  variant = "dashed",
  size = "sm",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (onFiles) {
      onFiles(files);
      return;
    }
    const file = files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => onFileLoad?.(img, dataUrl, file);
      img.onerror = () => onError?.();
      img.src = dataUrl;
    };
    reader.onerror = () => onError?.();
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <button
      aria-label="파일 업로드"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative flex w-full overflow-hidden flex-col items-center justify-center cursor-pointer rounded-[14px] border px-6 text-center transition-all duration-300",
        size === "sm"
          ? "h-[120px]"
          : size === "xl"
            ? "min-h-[500px]"
            : "min-h-[300px]",
        variant === "dashed" ? "border-dashed" : "border-solid",
        isDragging
          ? "border-[#a78bfa40] bg-[#a78bfa08]"
          : variant === "dashed"
            ? "border-[#ffffff20] bg-[#0c0c0c] hover:border-[#a78bfa66] hover:shadow-[0_0_24px_-4px_#a78bfa15]"
            : "border-[#ffffff15] bg-[#0c0c0c]",
      )}
    >
      {fileName && !onFiles ? (
        <>
          <p className="w-full truncate text-sm text-white/70">{fileName}</p>
          <p className="mt-1 text-xs text-white/30">클릭하여 변경</p>
        </>
      ) : (
        <>
          <motion.svg
            className="mx-auto mb-3 h-8 w-8 text-[#a78bfa44] transition-colors duration-300 group-hover:text-[#a78bfa77]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </motion.svg>
          <p className="text-sm text-[#888]">
            클릭하거나 드래그해서 파일 업로드
          </p>
          <p className="mt-1 text-xs text-white/20">{hint}</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          handleFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </button>
  );
}
