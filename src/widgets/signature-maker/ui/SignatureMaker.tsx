"use client";
import { useState } from "react";
import { trimToContent } from "@/features/signature/lib/trimToContent";
import { canvasToPngBlob } from "@/features/signature/lib/canvasToPngBlob";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { labelCls } from "@/shared/ui/styles";
import { Button } from "@/shared/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { useSignatureCanvas } from "./useSignatureCanvas";

const PADDING = 8;
const THICKNESS_OPTIONS = [
  { label: "Thin", value: 2 },
  { label: "Medium", value: 3 },
  { label: "Thick", value: 5 },
] as const;
const COLOR_OPTIONS = [
  { label: "검정", value: "#111" },
  { label: "파랑", value: "#1e3a8a" },
  { label: "빨강", value: "#b91c1c" },
] as const;

type Thickness = (typeof THICKNESS_OPTIONS)[number]["value"];

export function SignatureMaker() {
  const [thickness, setThickness] = useState<Thickness>(3);
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0].value);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    strokes,
    isDrawing,
    canvasRef,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    commitStroke,
    handleUndo,
    handleClear,
  } = useSignatureCanvas({ thickness, color });

  const handleDownload = async () => {
    const source = canvasRef.current;
    if (!source || strokes.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const trimmed = trimToContent(source, PADDING);
      if (!trimmed) {
        setError("서명을 먼저 그려 주세요.");
        return;
      }
      const blob = await canvasToPngBlob(trimmed);
      downloadBlob(blob, "signature.png");
    } catch {
      setError("다운로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasStrokes = strokes.length > 0;
  const showPlaceholder = !hasStrokes && !isDrawing;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-2">
          <span className={labelCls}>굵기</span>
          <ToggleGroup
            value={[String(thickness)]}
            onValueChange={(v: string[]) => {
              const next = Number(v[0]);
              if (next) setThickness(next as Thickness);
            }}
            spacing={4}
          >
            {THICKNESS_OPTIONS.map(({ label, value }) => (
              <ToggleGroupItem
                key={value}
                value={String(value)}
                variant="segment"
                size="seg"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          <span className={labelCls}>색상</span>
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={c.label}
                aria-pressed={color === c.value}
                className={`size-7 cursor-pointer rounded-[8px] border border-[#ffffff15] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] ${
                  color === c.value
                    ? "ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
                    : ""
                }`}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>

        <div className="ml-auto flex gap-1.5">
          <Button
            type="button"
            variant="segment"
            size="seg"
            onClick={handleUndo}
            disabled={!hasStrokes}
            className="disabled:opacity-40"
          >
            Undo
          </Button>
          <Button
            type="button"
            variant="segment"
            size="seg"
            onClick={handleClear}
            disabled={!hasStrokes}
            className="disabled:opacity-40"
          >
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#fafafa] sm:aspect-[2/1] sm:max-w-[800px] sm:flex-none"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          style={{
            touchAction: "none",
            cursor: "crosshair",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={commitStroke}
          onPointerCancel={commitStroke}
          aria-label="Signature canvas"
        />
        {showPlaceholder && (
          <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
            <span className="-rotate-90 text-sm text-[#aaa] sm:rotate-0">
              여기에 서명하세요
            </span>
          </div>
        )}
      </div>

      {error && <p className="shrink-0 text-xs text-red-400">{error}</p>}

      <div className="shrink-0">
        <DownloadButton
          onClick={handleDownload}
          disabled={!hasStrokes || isProcessing}
          isProcessing={isProcessing}
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
    </div>
  );
}
