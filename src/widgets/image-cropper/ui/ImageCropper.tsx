"use client";
import { useState, useRef } from "react";
import { cropImage } from "@/features/image-crop/lib/cropImage";
import type {
  CropBox,
  OutputFormat,
} from "@/features/image-crop/lib/cropImage";
import { EXT_MAP } from "@/shared/config/image-formats";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { loadImageFromFile } from "@/shared/lib/loadImageFromFile";
import { useDragHandling, clamp, MIN_CROP } from "./useDragHandling";
import { useCropPreview } from "./useCropPreview";
import { CropControlBar } from "./CropControlBar";

export function ImageCropper() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    useDragHandling({
      cropBox,
      canvasRef,
      aspectRatio,
      setCropBox,
    });

  const { previewUrl, previewSize } = useCropPreview({
    imageEl,
    cropBox,
    displaySize,
    outputFormat,
    quality,
  });

  const handleFileLoad = (
    img: HTMLImageElement,
    url: string,
    file: File,
  ): void => {
    setFileName(file.name);
    setImageEl(img);
    setDataUrl(url);
    setError(null);
    const containerW = containerRef.current?.clientWidth ?? 700;
    const maxH = 560;
    const scale = Math.min(
      containerW / img.naturalWidth,
      maxH / img.naturalHeight,
      1,
    );
    const displayW = Math.round(img.naturalWidth * scale);
    const displayH = Math.round(img.naturalHeight * scale);
    setDisplaySize({ w: displayW, h: displayH });
    setCropBox({ x: 0, y: 0, w: displayW, h: displayH });
    setAspectRatio(null);
  };

  const handleReplaceFile = (file: File): void => {
    loadImageFromFile(file, {
      onLoad: handleFileLoad,
      onError: () => setError("이미지를 불러오는 데 실패했습니다."),
    });
  };

  const handlePresetChange = (ratio: number | null): void => {
    if (ratio === null) {
      setAspectRatio(null);
      return;
    }
    if (!cropBox || !displaySize) return;
    let newW = cropBox.w;
    let newH = newW / ratio;
    if (newH > displaySize.h) {
      newH = displaySize.h;
      newW = newH * ratio;
    }
    if (newW > displaySize.w) {
      newW = displaySize.w;
      newH = newW / ratio;
    }
    newW = Math.max(MIN_CROP, newW);
    newH = Math.max(MIN_CROP, newH);
    const centerX = cropBox.x + cropBox.w / 2;
    const centerY = cropBox.y + cropBox.h / 2;
    const newX = clamp(centerX - newW / 2, 0, displaySize.w - newW);
    const newY = clamp(centerY - newH / 2, 0, displaySize.h - newH);
    setAspectRatio(ratio);
    setCropBox({ x: newX, y: newY, w: newW, h: newH });
  };

  const handleDownload = async (): Promise<void> => {
    if (!imageEl || !cropBox || !displaySize) return;
    setIsConverting(true);
    setError(null);
    try {
      const scale = imageEl.naturalWidth / displaySize.w;
      const blob = await cropImage(
        imageEl,
        cropBox,
        scale,
        outputFormat,
        quality / 100,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cropped.${EXT_MAP[outputFormat]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      setError("크롭에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  const cropInfo =
    imageEl && cropBox && displaySize
      ? `${Math.round(cropBox.w * (imageEl.naturalWidth / displaySize.w))} × ${Math.round(cropBox.h * (imageEl.naturalWidth / displaySize.w))} px`
      : null;

  return (
    <div className="space-y-5">
      {/* 파일 교체용 input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReplaceFile(file);
        }}
      />

      {/* 컨트롤 바 — 이미지 로드된 경우에만 표시 */}
      {imageEl && (
        <CropControlBar
          fileName={fileName}
          isDragging={isDragging}
          aspectRatio={aspectRatio}
          outputFormat={outputFormat}
          onFileReplace={() => replaceInputRef.current?.click()}
          onFileDrop={handleReplaceFile}
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onPresetChange={handlePresetChange}
          onFormatChange={setOutputFormat}
        />
      )}

      {/* 품질 슬라이더 */}
      {outputFormat !== "image/png" && (
        <div className="flex items-center gap-3">
          <span className={`shrink-0 ${labelCls}`}>품질 {quality}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            aria-label={`품질 ${quality}%`}
            className="flex-1 cursor-pointer accent-[#a78bfa]"
          />
        </div>
      )}

      {/* 업로드 전: ImageUpload / 업로드 후: 크롭 캔버스 */}
      {imageEl && dataUrl && displaySize ? (
        <div
          ref={containerRef}
          className="relative min-h-[500px] overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt="크롭 대상"
            width={displaySize.w}
            height={displaySize.h}
            style={{ display: "block", margin: "0 auto" }}
          />
          <canvas
            ref={canvasRef}
            width={displaySize.w}
            height={displaySize.h}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "crosshair",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
      ) : (
        <div ref={containerRef}>
          <ImageUpload
            onFileLoad={handleFileLoad}
            accept="image/png,image/jpeg,image/webp"
            hint="PNG, JPG, WebP — 자유롭게 크롭하고 비율을 조정하세요"
            size="xl"
          />
        </div>
      )}

      {/* 하단: 미리보기 + 정보 */}
      {(previewUrl || cropInfo || previewSize !== null) && (
        <div className="flex items-center gap-4 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          {previewUrl && (
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[10px] border border-[#ffffff15] bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="크롭 미리보기"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {cropInfo && (
              <p className="font-mono text-xs text-[#a78bfa]">{cropInfo}</p>
            )}
            {previewSize !== null && (
              <p className="text-[11px] text-[#888]">
                예상 크기{" "}
                <span className="font-mono text-[#bbb]">
                  {previewSize >= 1024 * 1024
                    ? `${(previewSize / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(previewSize / 1024)} KB`}
                </span>
              </p>
            )}
          </div>
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
