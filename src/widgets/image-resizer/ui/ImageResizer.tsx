"use client";
import { useState, useRef } from "react";
import { resizeImage } from "@/features/image-resize/lib/resizeImage";
import { EXT_MAP, type OutputFormat } from "@/shared/config/image-formats";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { loadImageFromFile } from "@/shared/lib/loadImageFromFile";
import { useResizePreview } from "./useResizePreview";
import { ResizeControlBar } from "./ResizeControlBar";
import { DownloadButton } from "@/shared/ui/DownloadButton";

const CHECKER_BG = `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='8' height='8' fill='%23111'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23111'/%3E%3C/svg%3E")`;

export function ImageResizer() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { previewUrl, previewSize } = useResizePreview({
    imageEl,
    width,
    height,
    outputFormat,
    quality,
  });

  const handleFileLoad = (img: HTMLImageElement, _url: string, file: File) => {
    setFileName(file.name);
    setImageEl(img);
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    setNaturalSize({ w, h });
    setWidth(w);
    setHeight(h);
    setLocked(true);
    setError(null);
  };

  const handleReplaceFile = (file: File) => {
    loadImageFromFile(file, {
      onLoad: handleFileLoad,
      onError: () => setError("이미지를 불러오는 데 실패했습니다."),
    });
  };

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, Math.min(8192, val));
    setWidth(w);
    if (locked && naturalSize) {
      setHeight(Math.round(w / (naturalSize.w / naturalSize.h)));
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, Math.min(8192, val));
    setHeight(h);
    if (locked && naturalSize) {
      setWidth(Math.round(h * (naturalSize.w / naturalSize.h)));
    }
  };

  const handleDownload = async () => {
    if (!imageEl) return;
    setIsConverting(true);
    setError(null);
    try {
      const blob = await resizeImage(
        imageEl,
        width,
        height,
        outputFormat,
        quality / 100,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resized.${EXT_MAP[outputFormat]}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      setError("변환에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 파일 교체용 input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReplaceFile(file);
        }}
      />

      {/* 컨트롤 바 — 이미지 로드된 경우에만 */}
      {imageEl && (
        <ResizeControlBar
          fileName={fileName}
          isDragging={isDragging}
          width={width}
          height={height}
          locked={locked}
          outputFormat={outputFormat}
          quality={quality}
          onFileReplace={() => replaceInputRef.current?.click()}
          onFileDrop={handleReplaceFile}
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onLockToggle={() => setLocked((v) => !v)}
          onFormatChange={setOutputFormat}
          onQualityChange={setQuality}
        />
      )}

      {/* 업로드 전: ImageUpload / 업로드 후: 미리보기 */}
      {imageEl && previewUrl ? (
        <div
          className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c]"
          style={{ backgroundImage: CHECKER_BG, backgroundSize: "16px 16px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="미리보기"
            className="max-h-[500px] max-w-full object-contain"
          />
        </div>
      ) : (
        <ImageUpload
          onFileLoad={handleFileLoad}
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
          hint="PNG, JPG, WebP, SVG, AVIF — 최대 8192px"
          size="xl"
        />
      )}

      {/* 하단 정보 바 — 이미지 로드된 경우에만 */}
      {imageEl && naturalSize && (
        <div className="flex items-center justify-between rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          <span className="font-mono text-xs text-[#a78bfa]">
            {naturalSize.w === width && naturalSize.h === height
              ? `${naturalSize.w} × ${naturalSize.h} (원본 유지)`
              : `${naturalSize.w} × ${naturalSize.h} → ${width} × ${height}`}
          </span>
          {previewSize !== null && (
            <span className="font-mono text-xs text-[#bbb]">
              {previewSize >= 1024 * 1024
                ? `${(previewSize / 1024 / 1024).toFixed(1)} MB`
                : `${Math.round(previewSize / 1024)} KB`}
            </span>
          )}
        </div>
      )}

      {/* 에러 */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* 다운로드 */}
      <DownloadButton
        onClick={handleDownload}
        disabled={!imageEl || isConverting}
        isProcessing={isConverting}
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
        Download
      </DownloadButton>
    </div>
  );
}
