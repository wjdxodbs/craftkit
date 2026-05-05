"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  drawSmoothStroke,
  midpoint,
  renderAllStrokes,
  type Stroke,
} from "@/features/signature/lib/smoothStroke";

const DEFAULT_W = 800;
const DEFAULT_H = 400;

export function useSignatureCanvas({
  thickness,
  color,
}: {
  thickness: number;
  color: string;
}) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
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
      color,
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

  return {
    strokes,
    isDrawing,
    canvasRef,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    commitStroke,
    handleUndo,
    handleClear,
  };
}
