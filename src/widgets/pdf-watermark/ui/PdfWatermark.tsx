"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { usePdfWatermark } from "./usePdfWatermark";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { labelCls, segBtn } from "@/shared/ui/styles";
import type { WatermarkOptions } from "@/features/pdf-watermark/lib/addWatermarkToPdf";

const inputCls =
  "w-full rounded-[10px] border border-[#ffffff15] bg-[#131313] px-3 py-2 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#a78bfa40]";

const POSITIONS = [
  { value: "center" as const, label: "중앙" },
  { value: "top-left" as const, label: "좌상" },
  { value: "top-right" as const, label: "우상" },
  { value: "bottom-left" as const, label: "좌하" },
  { value: "bottom-right" as const, label: "우하" },
];

type DisplayedSize = { width: number; height: number; scale: number };

// scale = offsetWidth / naturalWidth
// scaleFactor(PDF pt → screen px) = scale * 0.7 (0.7 = render scale)

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

    // PDF pt → screen px 변환 배율
    const scaleFactor = size.scale * 0.7;
    const scaledFontPx = Math.max(6, fontSize * scaleFactor);

    ctx.font = `${scaledFontPx}px Helvetica, Arial, sans-serif`;
    const textWidthPx = ctx.measureText(text).width;

    // PDF와 동일한 step 공식 (screen px 단위로 변환)
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
        // PDF degrees(45)는 screen에서 45° CW (y축 반전)
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  }, [text, fontSize, opacity, color, size, spacing]);

  return (
    <canvas
      ref={canvasRef}
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
  const replaceInputRef = useRef<HTMLInputElement>(null);
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
      {/* 파일 정보 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fff]">{fileName}</h3>
        <button
          type="button"
          onClick={() => replaceInputRef.current?.click()}
          className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
        >
          파일 교체
        </button>
        <input
          ref={replaceInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setDisplayedSize(null);
              handleFile(file);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* 미리보기 */}
      {(previewUrl || isRenderingPreview) && (
        <div className="overflow-hidden rounded-[14px] border border-[#ffffff15]">
          {isRenderingPreview && !previewUrl ? (
            <div className="flex h-32 items-center justify-center bg-[#0c0c0c] text-xs text-[#555]">
              미리보기 생성 중…
            </div>
          ) : previewUrl ? (
            <div className="flex justify-center bg-[#080808] py-4">
              <div className="relative">
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
          <p className="bg-[#0c0c0c] px-3 py-1.5 text-center text-[10px] text-[#444]">
            미리보기 — 실제 결과와 다소 다를 수 있습니다
          </p>
        </div>
      )}

      {/* 옵션 패널 */}
      <div className="space-y-4 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
        {/* 텍스트 */}
        <div className="space-y-2">
          <p className={labelCls}>워터마크 텍스트</p>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: CONFIDENTIAL"
            className={inputCls}
          />
        </div>

        {/* 배치 모드 */}
        <div className="space-y-2">
          <p className={labelCls}>배치 모드</p>
          <div className="flex gap-2">
            <button
              type="button"
              className={segBtn(mode === "tile")}
              onClick={() => setMode("tile")}
            >
              대각 반복
            </button>
            <button
              type="button"
              className={segBtn(mode === "single")}
              onClick={() => setMode("single")}
            >
              단일 위치
            </button>
          </div>
        </div>

        {/* 위치 (single 모드일 때만) */}
        {mode === "single" && (
          <div className="space-y-2">
            <p className={labelCls}>위치</p>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={segBtn(position === p.value)}
                  onClick={() => setPosition(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 간격 (tile 모드일 때만) */}
        {mode === "tile" && (
          <div className="space-y-2">
            <p className={labelCls}>
              간격 <span className="text-[#aaa]">{spacing.toFixed(1)}x</span>
            </p>
            <input
              type="range"
              min={50}
              max={200}
              value={Math.round(spacing * 100)}
              onChange={(e) => setSpacing(Number(e.target.value) / 100)}
              className="w-full accent-[#a78bfa]"
            />
          </div>
        )}

        {/* 폰트 크기 */}
        <div className="space-y-2">
          <p className={labelCls}>
            폰트 크기 <span className="text-[#aaa]">{fontSize}pt</span>
          </p>
          <input
            type="range"
            min={16}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[#a78bfa]"
          />
        </div>

        {/* 불투명도 */}
        <div className="space-y-2">
          <p className={labelCls}>
            불투명도{" "}
            <span className="text-[#aaa]">{Math.round(opacity * 100)}%</span>
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="w-full accent-[#a78bfa]"
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
              className="h-8 w-12 cursor-pointer rounded-[6px] border border-[#ffffff15] bg-transparent"
            />
            <span className="font-mono text-xs text-[#777]">
              {color.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
          {error}
        </div>
      )}

      {/* 실행 버튼 */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={apply}
          disabled={!text.trim() || isProcessing}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isProcessing ? "처리 중…" : "워터마크 적용 · 다운로드"}
        </button>
      </motion.div>
    </div>
  );
}
