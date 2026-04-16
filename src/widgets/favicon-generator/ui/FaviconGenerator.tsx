"use client";
import { useState } from "react";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { generateFavicons } from "@/features/favicon-export/lib/generateFavicons";
import { downloadBlob } from "@/shared/lib/zip";
import { FAVICON_SIZES } from "@/shared/config/favicon-sizes";
import { DownloadButton } from "@/shared/ui/DownloadButton";

const PREVIEW_SIZES = [16, 32, 180, 192];
const PREVIEW_DISPLAY_SIZE: Record<number, number> = {
  16: 16,
  32: 32,
  180: 56,
  192: 64,
};

export function FaviconGenerator() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img);
    setDataUrl(url);
  };

  const handleDownload = async () => {
    if (!imageEl) return;
    setIsGenerating(true);
    try {
      const zip = await generateFavicons(imageEl);
      downloadBlob("favicon-package.zip", zip);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload */}
      <ImageUpload onFileLoad={handleFileLoad} />

      {/* Preview */}
      <div
        className="flex items-end justify-center gap-6 overflow-hidden rounded-[14px] border border-[#ffffff15] p-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='8' height='8' fill='%23111'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23111'/%3E%3C/svg%3E")`,
          backgroundSize: "16px 16px",
        }}
      >
        {PREVIEW_SIZES.map((size) => {
          const displaySize = PREVIEW_DISPLAY_SIZE[size] ?? Math.min(size, 48);
          return (
            <div key={size} className="flex flex-col items-center gap-2">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataUrl}
                  alt={`${size}px preview`}
                  style={{ width: displaySize, height: displaySize }}
                  className="rounded border border-[#ffffff25] object-cover"
                />
              ) : (
                <div
                  style={{ width: displaySize, height: displaySize }}
                  className="rounded border border-[#ffffff20] bg-[#0a0a0a]"
                />
              )}
              <span className="rounded bg-[#0c0c0c]/80 px-1.5 py-0.5 text-[10px] text-[#888]">
                {size}px
              </span>
            </div>
          );
        })}
      </div>

      {/* File list */}
      <div className="rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#888]">생성 파일</span>
          <span className="rounded-md border border-[#a78bfa14] bg-[#a78bfa0c] px-2 py-0.5 text-[10px] font-medium text-[#a78bfa]">
            {FAVICON_SIZES.length + 2}개
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#ffffff08] py-[7px]">
          <span className="font-mono text-xs text-[#ccc]">favicon.ico</span>
          <span className="text-[10px] text-[#888]">16, 32, 48px</span>
        </div>
        {FAVICON_SIZES.map(({ filename, size }) => (
          <div
            key={filename}
            className="flex items-center justify-between border-b border-[#ffffff08] py-[7px] last:border-b-0"
          >
            <span className="font-mono text-xs text-[#ccc]">{filename}</span>
            <span className="text-[10px] text-[#888]">
              {size} x {size}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-[7px]">
          <span className="font-mono text-xs text-[#ccc]">manifest.json</span>
          <span className="text-[10px] text-[#888]">PWA</span>
        </div>
      </div>

      {/* Download */}
      <DownloadButton
        onClick={handleDownload}
        disabled={!imageEl || isGenerating}
        isProcessing={isGenerating}
        processingText="생성 중…"
      >
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download ZIP
      </DownloadButton>
    </div>
  );
}
