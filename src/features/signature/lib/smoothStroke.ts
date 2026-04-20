export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  thickness: number;
  color: string;
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
): void {
  const { points, thickness, color } = stroke;
  if (points.length === 0) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = thickness;

  if (points.length === 1) {
    const [p] = points;
    ctx.beginPath();
    ctx.arc(p.x, p.y, thickness / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const mp = midpoint(points[i], points[i + 1]);
    ctx.quadraticCurveTo(points[i].x, points[i].y, mp.x, mp.y);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

export function renderAllStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  cssWidth: number,
  cssHeight: number,
): void {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  for (const stroke of strokes) {
    drawSmoothStroke(ctx, stroke);
  }
}
