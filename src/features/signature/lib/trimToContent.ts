export function trimToContent(
  canvas: HTMLCanvasElement,
  padding: number,
): HTMLCanvasElement | null {
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const { data } = ctx.getImageData(0, 0, w, h);

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return null;

  const pad = Math.max(0, padding);
  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const outW = contentW + pad * 2;
  const outH = contentH + pad * 2;

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const outCtx = out.getContext("2d");
  if (!outCtx) return null;

  outCtx.drawImage(
    canvas,
    minX,
    minY,
    contentW,
    contentH,
    pad,
    pad,
    contentW,
    contentH,
  );

  return out;
}
