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

const WATERMARK_TEXT_MAX_LENGTH = 30;
// 실제 PDF 렌더링과 동일한 폰트(NanumGothic)를 미리보기 캔버스에서 쓰기 위해
// FontFace API로 동적 등록한다
const WATERMARK_FONT_FAMILY = "NanumGothicWatermark";
const WATERMARK_FONT_STACK = `"${WATERMARK_FONT_FAMILY}", Helvetica, Arial, sans-serif`;

type DisplayedSize = { width: number; height: number; scale: number };

function SingleImageOverlay({
  imageDataUrl,
  imageWidth,
  opacity,
  position,
  size,
}: {
  imageDataUrl: string;
  imageWidth: number;
  opacity: number;
  position: WatermarkOptions["position"];
  size: DisplayedSize;
}) {
  const scaledWidthPx = Math.max(8, Math.round(imageWidth * size.scale * 0.7));
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageDataUrl}
        alt="워터마크"
        style={{
          position: "absolute",
          ...POSITION_STYLES[position],
          width: scaledWidthPx,
          height: "auto",
          opacity,
          userSelect: "none",
        }}
      />
    </div>
  );
}

function TileOverlay({
  text,
  fontSize,
  opacity,
  color,
  size,
  spacing,
  rotation,
  fontReady,
}: {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  size: DisplayedSize;
  spacing: number;
  rotation: number;
  fontReady: boolean;
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

    ctx.font = `${scaledFontPx}px ${WATERMARK_FONT_STACK}`;
    const textWidthPx = ctx.measureText(text).width;

    const stepPx = Math.max(
      Math.max(textWidthPx * 0.7 + 50 * scaleFactor, 100 * scaleFactor) *
        spacing,
      1,
    );

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    // 사용자 회전은 CSS 컨벤션(시계 양수). 캔버스도 Y-down 시계 양수라 그대로 사용
    const radians = (rotation * Math.PI) / 180;

    for (let x = -size.width; x < size.width * 2; x += stepPx) {
      for (let y = -size.height; y < size.height * 2; y += stepPx) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(radians);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  }, [text, fontSize, opacity, color, size, spacing, rotation, fontReady]);

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
  rotation,
}: {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: WatermarkOptions["position"];
  size: DisplayedSize;
  rotation: number;
}) {
  const scaledFontPx = Math.max(6, Math.round(fontSize * size.scale * 0.7));
  // POSITION_STYLES.center는 transform: translate(-50%, -50%)을 이미 갖고 있음
  // 회전을 추가할 때 기존 transform과 결합 필요. CSS 컨벤션 그대로 사용.
  const baseTransform = POSITION_STYLES[position].transform ?? "";
  const transform = baseTransform
    ? `${baseTransform} rotate(${rotation}deg)`
    : `rotate(${rotation}deg)`;
  return (
    <div className="pointer-events-none absolute inset-0">
      <span
        style={{
          position: "absolute",
          ...POSITION_STYLES[position],
          transform,
          color,
          fontSize: scaledFontPx,
          opacity,
          fontFamily: WATERMARK_FONT_STACK,
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
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const load = async () => {
      if (document.fonts.check(`16px "${WATERMARK_FONT_FAMILY}"`)) {
        if (!cancelled) setFontReady(true);
        return;
      }
      try {
        const font = new FontFace(
          WATERMARK_FONT_FAMILY,
          "url(/fonts/NanumGothic.ttf)",
        );
        const loaded = await font.load();
        if (cancelled) return;
        document.fonts.add(loaded);
        setFontReady(true);
      } catch {
        // 로드 실패 시 시스템 폴백 사용
        if (!cancelled) setFontReady(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    fileName,
    isProcessing,
    error,
    previewUrl,
    isRenderingPreview,
    watermarkType,
    setWatermarkType,
    text,
    setText,
    fontSize,
    setFontSize,
    color,
    setColor,
    imageDataUrl,
    imageWidth,
    setImageWidth,
    setImage,
    hasImage,
    opacity,
    setOpacity,
    mode,
    setMode,
    position,
    setPosition,
    spacing,
    setSpacing,
    rotation,
    setRotation,
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
                {watermarkType === "text" &&
                  text.trim() &&
                  displayedSize &&
                  (mode === "tile" ? (
                    <TileOverlay
                      text={text}
                      fontSize={fontSize}
                      opacity={opacity}
                      color={color}
                      size={displayedSize}
                      spacing={spacing}
                      rotation={rotation}
                      fontReady={fontReady}
                    />
                  ) : (
                    <SingleOverlay
                      text={text}
                      fontSize={fontSize}
                      opacity={opacity}
                      color={color}
                      position={position}
                      size={displayedSize}
                      rotation={rotation}
                    />
                  ))}
                {watermarkType === "image" && imageDataUrl && displayedSize && (
                  <SingleImageOverlay
                    imageDataUrl={imageDataUrl}
                    imageWidth={imageWidth}
                    opacity={opacity}
                    position={position}
                    size={displayedSize}
                  />
                )}
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
        {/* 타입 토글 */}
        <div className="space-y-2">
          <p className={labelCls}>워터마크 타입</p>
          <ToggleGroup
            value={[watermarkType]}
            onValueChange={(v: string[]) => {
              const next = v[0];
              if (next === "text" || next === "image") setWatermarkType(next);
            }}
            spacing={4}
          >
            <ToggleGroupItem value="text" variant="segment" size="seg">
              텍스트
            </ToggleGroupItem>
            <ToggleGroupItem value="image" variant="segment" size="seg">
              이미지
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* 텍스트 입력 — text 모드 전용 */}
        {watermarkType === "text" && (
          <div className="space-y-2">
            <Label htmlFor="wm-text" className={labelCls}>
              워터마크 텍스트
            </Label>
            <div className="relative">
              <Input
                id="wm-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={WATERMARK_TEXT_MAX_LENGTH}
                placeholder="예: CONFIDENTIAL"
                className="pr-14"
              />
              <span
                className={`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] ${
                  text.length >= WATERMARK_TEXT_MAX_LENGTH * 0.9
                    ? "text-[#a78bfa]"
                    : "text-[#888]"
                }`}
              >
                {text.length} / {WATERMARK_TEXT_MAX_LENGTH}
              </span>
            </div>
          </div>
        )}

        {/* 이미지 업로드 — image 모드 전용 */}
        {watermarkType === "image" && (
          <div className="space-y-2">
            <p className={labelCls}>워터마크 이미지</p>
            <ImageUpload
              accept="image/png,image/jpeg"
              hint="PNG, JPG — 투명 배경 PNG 권장"
              size="sm"
              onFiles={(files) => {
                if (files[0]) setImage(files[0]);
              }}
            />
          </div>
        )}

        {/* 배치 모드 — 텍스트 전용 (이미지는 항상 단일 위치) */}
        {watermarkType === "text" && (
          <div className="space-y-2">
            <p className={labelCls}>배치 모드</p>
            <ToggleGroup
              value={[mode]}
              onValueChange={(v: string[]) => {
                const next = v[0];
                if (next === "tile" || next === "single") setMode(next);
              }}
              spacing={4}
            >
              <ToggleGroupItem value="tile" variant="segment" size="seg">
                대각 반복
              </ToggleGroupItem>
              <ToggleGroupItem value="single" variant="segment" size="seg">
                단일 위치
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {/* 위치 — 이미지는 항상, 텍스트는 single 모드에서만 */}
        {(watermarkType === "image" || mode === "single") && (
          <div className="space-y-2">
            <p className={labelCls}>위치</p>
            <ToggleGroup
              value={[position]}
              onValueChange={(v: string[]) => {
                const next = v[0] as WatermarkOptions["position"] | undefined;
                if (next) setPosition(next);
              }}
              spacing={4}
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

        {/* 간격 — 텍스트 tile 모드 전용 */}
        {watermarkType === "text" && mode === "tile" && (
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

        {/* 폰트 크기 — text 모드 */}
        {watermarkType === "text" && (
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
        )}

        {/* 회전 — text 모드 */}
        {watermarkType === "text" && (
          <div className="space-y-2">
            <p className={labelCls}>
              회전 <span className="text-[#aaa]">{rotation}°</span>
            </p>
            <Slider
              min={-45}
              max={45}
              value={[rotation]}
              onValueChange={(v) => setRotation(Array.isArray(v) ? v[0] : v)}
              aria-label="회전 각도"
              aria-valuetext={`${rotation}도`}
            />
          </div>
        )}

        {/* 이미지 너비 — image 모드 */}
        {watermarkType === "image" && (
          <div className="space-y-2">
            <p className={labelCls}>
              이미지 너비 <span className="text-[#aaa]">{imageWidth}pt</span>
            </p>
            <Slider
              min={50}
              max={500}
              value={[imageWidth]}
              onValueChange={(v) => setImageWidth(Array.isArray(v) ? v[0] : v)}
              aria-label="이미지 너비"
              aria-valuetext={`${imageWidth}pt`}
            />
          </div>
        )}

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

        {/* 색상 — text 모드 전용 */}
        {watermarkType === "text" && (
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
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DownloadButton
        onClick={apply}
        disabled={
          isProcessing ||
          (watermarkType === "text" && !text.trim()) ||
          (watermarkType === "image" && !hasImage)
        }
        isProcessing={isProcessing}
      >
        워터마크 적용 · 다운로드
      </DownloadButton>
    </div>
  );
}
