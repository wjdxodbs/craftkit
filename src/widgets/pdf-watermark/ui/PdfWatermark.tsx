"use client";
import { useRef, useState, useEffect } from "react";
import { usePdfWatermark } from "./usePdfWatermark";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { FileReplaceHeader } from "@/shared/ui/FileReplaceHeader";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import type { WatermarkOptions } from "@/features/pdf-watermark/lib/addWatermarkToPdf";

const POSITIONS = [
  { value: "center" as const, label: "중앙" },
  { value: "top-left" as const, label: "좌상" },
  { value: "top-right" as const, label: "우상" },
  { value: "bottom-left" as const, label: "좌하" },
  { value: "bottom-right" as const, label: "우하" },
];

type DisplayedSize = { width: number; height: number; scale: number };

function TileOverlay({
  text,
  fontSize,
  opacity,
  color,
  size,
  spacing,
}: {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  size: DisplayedSize;
  spacing: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size.width;
    canvas.height = size.height;
    ctx.clearRect(0, 0, size.width, size.height);

    const scaleFactor = size.scale * 0.7;
    const scaledFontPx = Math.max(6, fontSize * scaleFactor);

    ctx.font = `${scaledFontPx}px Helvetica, Arial, sans-serif`;
    const textWidthPx = ctx.measureText(text).width;

    const stepPx = Math.max(
      Math.max(textWidthPx * 0.7 + 50 * scaleFactor, 100 * scaleFactor) *
        spacing,
      1,
    );

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    for (let x = -size.width; x < size.width * 2; x += stepPx) {
      for (let y = -size.height; y < size.height * 2; y += stepPx) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  }, [text, fontSize, opacity, color, size, spacing]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="워터마크 미리보기"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        pointerEvents: "none",
      }}
    />
  );
}

const POSITION_STYLES: Record<
  WatermarkOptions["position"],
  React.CSSProperties
> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-left": { top: "4%", left: "3%" },
  "top-right": { top: "4%", right: "3%" },
  "bottom-left": { bottom: "4%", left: "3%" },
  "bottom-right": { bottom: "4%", right: "3%" },
};

function SingleOverlay({
  text,
  fontSize,
  opacity,
  color,
  position,
  size,
}: {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: WatermarkOptions["position"];
  size: DisplayedSize;
}) {
  const scaledFontPx = Math.max(6, Math.round(fontSize * size.scale * 0.7));
  return (
    <div className="pointer-events-none absolute inset-0">
      <span
        style={{
          position: "absolute",
          ...POSITION_STYLES[position],
          color,
          fontSize: scaledFontPx,
          opacity,
          fontFamily: "Helvetica, Arial, sans-serif",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </div>
  );
}

export function PdfWatermark() {
  const [displayedSize, setDisplayedSize] = useState<DisplayedSize | null>(
    null,
  );

  const {
    fileName,
    isProcessing,
    error,
    previewUrl,
    isRenderingPreview,
    text,
    setText,
    fontSize,
    setFontSize,
    opacity,
    setOpacity,
    color,
    setColor,
    mode,
    setMode,
    position,
    setPosition,
    spacing,
    setSpacing,
    handleFile,
    apply,
  } = usePdfWatermark();

  const handleReplace = (file: File) => {
    setDisplayedSize(null);
    handleFile(file);
  };

  if (!fileName) {
    return (
      <ImageUpload
        accept="application/pdf"
        hint="워터마크를 추가할 PDF 업로드"
        size="lg"
        onFiles={(files) => {
          if (files[0]) handleFile(files[0]);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <FileReplaceHeader
        fileName={fileName}
        accept="application/pdf"
        onFile={handleReplace}
      />

      {/* 미리보기 */}
      {(previewUrl || isRenderingPreview) && (
        <div className="overflow-hidden rounded-[14px] border border-[#ffffff15]">
          {isRenderingPreview && !previewUrl ? (
            <div className="flex h-32 items-center justify-center bg-[#0c0c0c] text-xs text-[#888]">
              미리보기 생성 중…
            </div>
          ) : previewUrl ? (
            <div className="flex justify-center bg-[#080808] py-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="PDF 미리보기"
                  style={{
                    maxHeight: "480px",
                    width: "auto",
                    display: "block",
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setDisplayedSize({
                      width: img.offsetWidth,
                      height: img.offsetHeight,
                      scale: img.offsetWidth / img.naturalWidth,
                    });
                  }}
                  onError={() => setDisplayedSize(null)}
                />
                {text.trim() &&
                  displayedSize &&
                  (mode === "tile" ? (
                    <TileOverlay
                      text={text}
                      fontSize={fontSize}
                      opacity={opacity}
                      color={color}
                      size={displayedSize}
                      spacing={spacing}
                    />
                  ) : (
                    <SingleOverlay
                      text={text}
                      fontSize={fontSize}
                      opacity={opacity}
                      color={color}
                      position={position}
                      size={displayedSize}
                    />
                  ))}
              </div>
            </div>
          ) : null}
          <p className="bg-[#0c0c0c] px-3 py-1.5 text-center text-[10px] text-[#888]">
            미리보기 — 실제 결과와 다소 다를 수 있습니다
          </p>
        </div>
      )}

      {/* 옵션 패널 */}
      <div className="space-y-4 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
        {/* 텍스트 */}
        <div className="space-y-2">
          <Label htmlFor="wm-text" className={labelCls}>
            워터마크 텍스트
          </Label>
          <Input
            id="wm-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: CONFIDENTIAL"
          />
        </div>

        {/* 배치 모드 */}
        <div className="space-y-2">
          <p className={labelCls}>배치 모드</p>
          <ToggleGroup
            value={[mode]}
            onValueChange={(v: string[]) => {
              const next = v[0];
              if (next === "tile" || next === "single") setMode(next);
            }}
            spacing={8}
          >
            <ToggleGroupItem value="tile" variant="segment" size="seg">
              대각 반복
            </ToggleGroupItem>
            <ToggleGroupItem value="single" variant="segment" size="seg">
              단일 위치
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* 위치 (single 모드일 때만) */}
        {mode === "single" && (
          <div className="space-y-2">
            <p className={labelCls}>위치</p>
            <ToggleGroup
              value={[position]}
              onValueChange={(v: string[]) => {
                const next = v[0] as WatermarkOptions["position"] | undefined;
                if (next) setPosition(next);
              }}
              spacing={8}
            >
              {POSITIONS.map((p) => (
                <ToggleGroupItem
                  key={p.value}
                  value={p.value}
                  variant="segment"
                  size="seg"
                >
                  {p.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* 간격 (tile 모드일 때만) */}
        {mode === "tile" && (
          <div className="space-y-2">
            <p className={labelCls}>
              간격 <span className="text-[#aaa]">{spacing.toFixed(1)}x</span>
            </p>
            <Slider
              min={50}
              max={200}
              value={[Math.round(spacing * 100)]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                setSpacing(n / 100);
              }}
              aria-label="간격"
              aria-valuetext={`${spacing.toFixed(1)}x`}
            />
          </div>
        )}

        {/* 폰트 크기 */}
        <div className="space-y-2">
          <p className={labelCls}>
            폰트 크기 <span className="text-[#aaa]">{fontSize}pt</span>
          </p>
          <Slider
            min={16}
            max={72}
            value={[fontSize]}
            onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)}
            aria-label="폰트 크기"
            aria-valuetext={`${fontSize}pt`}
          />
        </div>

        {/* 불투명도 */}
        <div className="space-y-2">
          <p className={labelCls}>
            불투명도{" "}
            <span className="text-[#aaa]">{Math.round(opacity * 100)}%</span>
          </p>
          <Slider
            min={0}
            max={100}
            value={[Math.round(opacity * 100)]}
            onValueChange={(v) => {
              const n = Array.isArray(v) ? v[0] : v;
              setOpacity(n / 100);
            }}
            aria-label="불투명도"
            aria-valuetext={`${Math.round(opacity * 100)}%`}
          />
        </div>

        {/* 색상 */}
        <div className="space-y-2">
          <p className={labelCls}>색상</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="워터마크 색상"
              className="h-8 w-12 cursor-pointer rounded-[6px] border border-[#ffffff15] bg-transparent"
            />
            <span className="font-mono text-xs text-[#888]">
              {color.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DownloadButton
        onClick={apply}
        disabled={!text.trim() || isProcessing}
        isProcessing={isProcessing}
      >
        워터마크 적용 · 다운로드
      </DownloadButton>
    </div>
  );
}
