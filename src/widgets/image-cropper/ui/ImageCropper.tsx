'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { cropImage } from '@/features/image-crop/lib/cropImage'
import type { CropBox, OutputFormat } from '@/features/image-crop/lib/cropImage'
import { Button } from '@/shared/ui/button'

const HANDLE_SIZE = 8

function drawOverlay(canvas: HTMLCanvasElement, box: CropBox) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, width, height)
  ctx.clearRect(box.x, box.y, box.w, box.h)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 1
  ctx.strokeRect(box.x, box.y, box.w, box.h)
  ctx.fillStyle = 'white'
  const corners: [number, number][] = [
    [box.x, box.y],
    [box.x + box.w - HANDLE_SIZE, box.y],
    [box.x, box.y + box.h - HANDLE_SIZE],
    [box.x + box.w - HANDLE_SIZE, box.y + box.h - HANDLE_SIZE],
  ]
  corners.forEach(([cx, cy]) => ctx.fillRect(cx, cy, HANDLE_SIZE, HANDLE_SIZE))
}

type HandleType = 'nw' | 'ne' | 'sw' | 'se' | 'move'

interface DragState {
  type: HandleType
  startX: number
  startY: number
  startBox: CropBox
}

const MIN_CROP = 20

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function hitTest(x: number, y: number, box: CropBox): HandleType | null {
  const { x: bx, y: by, w, h } = box
  const hs = HANDLE_SIZE
  if (x >= bx && x <= bx + hs && y >= by && y <= by + hs) return 'nw'
  if (x >= bx + w - hs && x <= bx + w && y >= by && y <= by + hs) return 'ne'
  if (x >= bx && x <= bx + hs && y >= by + h - hs && y <= by + h) return 'sw'
  if (x >= bx + w - hs && x <= bx + w && y >= by + h - hs && y <= by + h) return 'se'
  if (x >= bx && x <= bx + w && y >= by && y <= by + h) return 'move'
  return null
}

function applyDrag(
  drag: DragState,
  dx: number,
  dy: number,
  canvasW: number,
  canvasH: number,
  aspectRatio: number | null
): CropBox {
  const sb = drag.startBox
  let { x, y, w, h } = sb

  if (drag.type === 'move') {
    return {
      x: clamp(sb.x + dx, 0, canvasW - sb.w),
      y: clamp(sb.y + dy, 0, canvasH - sb.h),
      w: sb.w,
      h: sb.h,
    }
  }

  if (drag.type === 'se') {
    if (aspectRatio) {
      w = clamp(sb.w + dx, MIN_CROP, canvasW - sb.x)
      h = w / aspectRatio
      if (h > canvasH - sb.y) { h = canvasH - sb.y; w = h * aspectRatio }
      w = Math.max(w, MIN_CROP); h = Math.max(h, MIN_CROP)
    } else {
      w = clamp(sb.w + dx, MIN_CROP, canvasW - sb.x)
      h = clamp(sb.h + dy, MIN_CROP, canvasH - sb.y)
    }
  } else if (drag.type === 'sw') {
    if (aspectRatio) {
      w = clamp(sb.w - dx, MIN_CROP, sb.x + sb.w)
      h = w / aspectRatio
      if (h > canvasH - sb.y) { h = canvasH - sb.y; w = h * aspectRatio }
      w = Math.max(w, MIN_CROP); h = Math.max(h, MIN_CROP)
    } else {
      w = clamp(sb.w - dx, MIN_CROP, sb.x + sb.w)
      h = clamp(sb.h + dy, MIN_CROP, canvasH - sb.y)
    }
    x = sb.x + sb.w - w
  } else if (drag.type === 'ne') {
    if (aspectRatio) {
      w = clamp(sb.w + dx, MIN_CROP, canvasW - sb.x)
      h = w / aspectRatio
      if (h > sb.y + sb.h) { h = sb.y + sb.h; w = h * aspectRatio }
      w = Math.max(w, MIN_CROP); h = Math.max(h, MIN_CROP)
    } else {
      w = clamp(sb.w + dx, MIN_CROP, canvasW - sb.x)
      h = clamp(sb.h - dy, MIN_CROP, sb.y + sb.h)
    }
    y = sb.y + sb.h - h
  } else if (drag.type === 'nw') {
    if (aspectRatio) {
      w = clamp(sb.w - dx, MIN_CROP, sb.x + sb.w)
      h = w / aspectRatio
      if (h > sb.y + sb.h) { h = sb.y + sb.h; w = h * aspectRatio }
      w = Math.max(w, MIN_CROP); h = Math.max(h, MIN_CROP)
    } else {
      w = clamp(sb.w - dx, MIN_CROP, sb.x + sb.w)
      h = clamp(sb.h - dy, MIN_CROP, sb.y + sb.h)
    }
    x = sb.x + sb.w - w
    y = sb.y + sb.h - h
  }

  return { x, y, w, h }
}

function getCanvasPos(e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

const OUTPUT_FORMATS: { label: string; value: OutputFormat }[] = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
]

const EXT_MAP: Record<OutputFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const ASPECT_PRESETS: { label: string; value: number | null }[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
]

export function ImageCropper() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number } | null>(null)
  const [cropBox, setCropBox] = useState<CropBox | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !cropBox) return
    if (dragRef.current) return // 드래그 중에는 handlePointerMove가 직접 그림
    drawOverlay(canvas, cropBox)
  }, [cropBox])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cropBox || !canvasRef.current) return
    const canvas = canvasRef.current
    const pos = getCanvasPos(e, canvas)
    const type = hitTest(pos.x, pos.y, cropBox)
    if (!type) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { type, startX: pos.x, startY: pos.y, startBox: { ...cropBox } }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const pos = getCanvasPos(e, canvas)
    const dx = pos.x - dragRef.current.startX
    const dy = pos.y - dragRef.current.startY
    const newBox = applyDrag(dragRef.current, dx, dy, canvas.width, canvas.height, aspectRatio)
    setCropBox(newBox)
    drawOverlay(canvas, newBox)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handlePresetChange = (ratio: number | null) => {
    if (ratio === null) {
      setAspectRatio(null)
      return
    }
    if (!cropBox || !displaySize) return

    // 현재 너비 기준으로 높이 계산, 캔버스를 초과하면 높이 기준으로 재계산
    let newW = cropBox.w
    let newH = newW / ratio
    if (newH > displaySize.h) {
      newH = displaySize.h
      newW = newH * ratio
    }
    if (newW > displaySize.w) {
      newW = displaySize.w
      newH = newW / ratio
    }
    newW = Math.max(MIN_CROP, newW)
    newH = Math.max(MIN_CROP, newH)

    const centerX = cropBox.x + cropBox.w / 2
    const centerY = cropBox.y + cropBox.h / 2
    const newX = clamp(centerX - newW / 2, 0, displaySize.w - newW)
    const newY = clamp(centerY - newH / 2, 0, displaySize.h - newH)

    setAspectRatio(ratio)
    setCropBox({ x: newX, y: newY, w: newW, h: newH })
  }

  const handleDownload = async () => {
    if (!imageEl || !cropBox || !displaySize) return
    setIsConverting(true)
    setError(null)
    try {
      const scale = imageEl.naturalWidth / displaySize.w
      const blob = await cropImage(imageEl, cropBox, scale, outputFormat, quality / 100)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cropped.${EXT_MAP[outputFormat]}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch {
      setError('크롭에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
    setError(null)
    const containerW = containerRef.current?.clientWidth ?? 400
    const maxH = 500
    const scale = Math.min(containerW / img.naturalWidth, maxH / img.naturalHeight, 1)
    const displayW = Math.round(img.naturalWidth * scale)
    const displayH = Math.round(img.naturalHeight * scale)
    setDisplaySize({ w: displayW, h: displayH })
    setCropBox({ x: 0, y: 0, w: displayW, h: displayH })
    setAspectRatio(null)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 좌측: 컨트롤 */}
      <div className="space-y-5">
        <ImageUpload
          onFileLoad={handleFileLoad}
          accept="image/png,image/jpeg,image/webp"
        />

        {/* 비율 프리셋 */}
        <div>
          <label className="mb-2 block text-[11px] font-semibold tracking-widest text-foreground/35">비율</label>
          <div className="flex gap-2">
            {ASPECT_PRESETS.map(({ label, value }) => (
              <button
                type="button"
                key={label}
                onClick={() => handlePresetChange(value)}
                disabled={!imageEl}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-30 ${
                  aspectRatio === value
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 출력 포맷 */}
        <div>
          <label className="mb-2 block text-[11px] font-semibold tracking-widest text-foreground/35">출력 포맷</label>
          <div className="flex gap-2">
            {OUTPUT_FORMATS.map(({ label, value }) => (
              <button
                type="button"
                key={value}
                onClick={() => setOutputFormat(value)}
                disabled={!imageEl}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-30 ${
                  outputFormat === value
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 품질 슬라이더 */}
        {outputFormat !== 'image/png' && (
          <div>
            <label className="mb-2 block text-[11px] font-semibold tracking-widest text-foreground/35">품질 {quality}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        )}

        {/* 크롭 요약 */}
        <p className="text-xs text-white/30">
          {imageEl && cropBox && displaySize
            ? `${Math.round(cropBox.w * (imageEl.naturalWidth / displaySize.w))} × ${Math.round(cropBox.h * (imageEl.naturalWidth / displaySize.w))} px`
            : '이미지를 업로드하면 크롭 영역을 선택할 수 있습니다'}
        </p>
      </div>

      {/* 우측: 캔버스 + 다운로드 */}
      <div className="space-y-4">
        <div
          ref={containerRef}
          className="relative min-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
        >
          {imageEl && dataUrl && displaySize ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="크롭 대상"
                width={displaySize.w}
                height={displaySize.h}
                style={{ display: 'block', margin: '0 auto' }}
              />
              <canvas
                ref={canvasRef}
                width={displaySize.w}
                height={displaySize.h}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'crosshair',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <p className="text-xs text-white/20">이미지를 업로드하면 크롭 영역을 선택할 수 있습니다</p>
            </div>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            disabled={!imageEl || isConverting}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40"
          >
            {isConverting ? '처리 중…' : (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </Button>
        </motion.div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}
