"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  drawSmoothStroke,
  midpoint,
  renderAllStrokes,
  type Stroke,
} from "@/features/signature/lib/smoothStroke";
import { trimToContent } from "@/features/signature/lib/trimToContent";
import { canvasToPngBlob } from "@/features/signature/lib/canvasToPngBlob";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { labelCls, segBtn } from "@/shared/ui/styles";

const DEFAULT_W = 800;
const DEFAULT_H = 400;
const COLOR = "#111";
const PADDING = 8;
const THICKNESS_OPTIONS = [
  { label: "Thin", value: 2 },
  { label: "Medium", value: 3 },
  { label: "Thick", value: 5 },
] as const;

type Thickness = (typeof THICKNESS_OPTIONS)[number]["value"];

export function SignatureMaker() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [thickness, setThickness] = useState<Thickness>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasDims, setCanvasDims] = useState({ w: DEFAULT_W, h: DEFAULT_H });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const dprRef = useRef(1);
  // 첫 획 이후 캔버스 치수를 잠그는 플래그 — 세션 중 회전/리사이즈로 인한
  // 획 좌표 왜곡 방지
  const lockedRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCanvasDims({ w: Math.round(rect.width), h: Math.round(rect.height) });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      if (lockedRef.current) return;
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      const newW = Math.round(width);
      const newH = Math.round(height);
      setCanvasDims((prev) =>
        prev.w === newW && prev.h === newH ? prev : { w: newW, h: newH },
      );
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    canvas.width = canvasDims.w * dpr;
    canvas.height = canvasDims.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderAllStrokes(ctx, strokes, canvasDims.w, canvasDims.h);
    if (activeStrokeRef.current) {
      drawSmoothStroke(ctx, activeStrokeRef.current);
    }
  }, [canvasDims, strokes]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasDims.w / rect.width),
      y: (e.clientY - rect.top) * (canvasDims.h / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // 비활성 포인터에서 setPointerCapture가 실패해도 드로잉은 계속
    }
    const pos = getCanvasPos(e);
    const stroke: Stroke = {
      points: [pos],
      thickness,
      color: COLOR,
    };
    activeStrokeRef.current = stroke;
    setIsDrawing(true);

    const ctx = canvas.getContext("2d");
    if (ctx) drawSmoothStroke(ctx, stroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeStrokeRef.current;
    if (!active) return;
    const pos = getCanvasPos(e);
    active.points.push(pos);
    const pts = active.points;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (pts.length === 2) {
      const [a, b] = pts;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      return;
    }

    if (pts.length >= 3) {
      const a = pts[pts.length - 3];
      const b = pts[pts.length - 2];
      const c = pts[pts.length - 1];
      const start = midpoint(a, b);
      const end = midpoint(b, c);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(b.x, b.y, end.x, end.y);
      ctx.stroke();
    }
  };

  const commitStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // 이미 해제된 포인터는 무시
    }
    const active = activeStrokeRef.current;
    activeStrokeRef.current = null;
    setIsDrawing(false);
    if (active && active.points.length > 0) {
      lockedRef.current = true;
      setStrokes((prev) => [...prev, active]);
    }
  };

  const remeasureContainer = () => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const newW = Math.round(rect.width);
    const newH = Math.round(rect.height);
    setCanvasDims((prev) =>
      prev.w === newW && prev.h === newH ? prev : { w: newW, h: newH },
    );
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      if (next.length === 0) {
        lockedRef.current = false;
        remeasureContainer();
      }
      return next;
    });
  };

  const handleClear = () => {
    lockedRef.current = false;
    setStrokes([]);
    remeasureContainer();
  };

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
          <div className="flex gap-1.5">
            {THICKNESS_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setThickness(value)}
                className={segBtn(thickness === value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!hasStrokes}
            className={`${segBtn(false)} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            disabled={!hasStrokes}
            className={`${segBtn(false)} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Clear
          </button>
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
