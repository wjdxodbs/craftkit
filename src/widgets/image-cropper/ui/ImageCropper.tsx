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
import { Slider } from "@/shared/ui/slider";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { loadImageFromFile } from "@/shared/lib/loadImageFromFile";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { buildOutputName } from "@/shared/lib/fileName";
import { formatByteSize } from "@/shared/lib/format";
import { useDragHandling, clamp, MIN_CROP } from "./useDragHandling";
import { useCropPreview } from "./useCropPreview";
import { useFullImagePreview } from "./useFullImagePreview";
import { CropControlBar, type Orientation } from "./CropControlBar";

export function ImageCropper() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    useDragHandling({
      cropBox,
      canvasRef,
      aspectRatio,
      setCropBox,
    });

  const { previewSize } = useCropPreview({
    imageEl,
    cropBox,
    displaySize,
    outputFormat,
    quality,
  });

  const { fullPreviewUrl } = useFullImagePreview({
    imageEl,
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

  const handleOrientationChange = (next: Orientation): void => {
    setOrientation(next);
    // 1:1·Free 외에는 활성 비율을 자동으로 뒤집어 같은 의미의 가로↔세로로 이동
    if (aspectRatio !== null && aspectRatio !== 1) {
      handlePresetChange(1 / aspectRatio);
    }
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
      const cropW = Math.round(cropBox.w * scale);
      const cropH = Math.round(cropBox.h * scale);
      downloadBlob(
        blob,
        buildOutputName(fileName, `${cropW}x${cropH}`, EXT_MAP[outputFormat]),
      );
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
      {imageEl && (
        <CropControlBar
          fileName={fileName}
          aspectRatio={aspectRatio}
          orientation={orientation}
          outputFormat={outputFormat}
          onFileReplace={handleReplaceFile}
          onPresetChange={handlePresetChange}
          onOrientationChange={handleOrientationChange}
          onFormatChange={setOutputFormat}
        />
      )}

      {/* 품질 슬라이더 */}
      {outputFormat !== "image/png" && (
        <div className="flex items-center gap-3">
          <span className={`shrink-0 ${labelCls}`}>품질 {quality}%</span>
          <Slider
            min={0}
            max={100}
            value={[quality]}
            onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v)}
            aria-label={`품질 ${quality}%`}
            className="flex-1"
          />
        </div>
      )}

      {/* 업로드 전: ImageUpload / 업로드 후: 크롭 캔버스 */}
      {imageEl && dataUrl && displaySize ? (
        <div
          ref={containerRef}
          className="flex h-[560px] items-center justify-center overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c]"
        >
          <div
            className="relative"
            style={{ width: displaySize.w, height: displaySize.h }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullPreviewUrl ?? dataUrl}
              alt="크롭 대상"
              width={displaySize.w}
              height={displaySize.h}
              className="block"
            />
            <canvas
              ref={canvasRef}
              width={displaySize.w}
              height={displaySize.h}
              className="absolute inset-0"
              style={{ cursor: "crosshair" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
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

      {/* 하단: 크기 · 용량 정보 */}
      {(cropInfo || previewSize !== null) && (
        <div className="flex items-center justify-between rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          {cropInfo && (
            <span className="font-mono text-xs text-[#a78bfa]">{cropInfo}</span>
          )}
          {previewSize !== null && (
            <span className="text-[11px] text-[#888]">
              예상 크기{" "}
              <span className="font-mono text-[#bbb]">
                {formatByteSize(previewSize)}
              </span>
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
