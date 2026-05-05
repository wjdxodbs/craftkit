"use client";
import { useEffect, useRef } from "react";
import type { WatermarkOptions } from "@/features/pdf-watermark/lib/addWatermarkToPdf";

// 실제 PDF 렌더링과 동일한 폰트(NanumGothic)를 미리보기 캔버스에서 쓰기 위해
// FontFace API로 동적 등록한다 (등록은 PdfWatermark에서 수행)
export const WATERMARK_FONT_FAMILY = "NanumGothicWatermark";
export const WATERMARK_FONT_STACK = `"${WATERMARK_FONT_FAMILY}", Helvetica, Arial, sans-serif`;

export type DisplayedSize = { width: number; height: number; scale: number };

export const POSITION_STYLES: Record<
  WatermarkOptions["position"],
  React.CSSProperties
> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-left": { top: "4%", left: "3%" },
  "top-right": { top: "4%", right: "3%" },
  "bottom-left": { bottom: "4%", left: "3%" },
  "bottom-right": { bottom: "4%", right: "3%" },
};

export function TileOverlay({
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

export function SingleOverlay({
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

export function SingleImageOverlay({
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
