'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { cropImage } from '@/features/image-crop/lib/cropImage'
import type { CropBox, OutputFormat } from '@/features/image-crop/lib/cropImage'

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

const labelCls = 'text-[11px] font-medium text-[#777]'
const segBtn = (active: boolean, disabled = false) =>
  `cursor-pointer rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
    disabled ? 'opacity-30 cursor-not-allowed' : ''
  } ${
    active
      ? 'border border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]'
      : 'border border-[#ffffff15] text-[#777] hover:border-[#ffffff25] hover:text-[#bbb]'
  }`

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
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !cropBox) return
    if (dragRef.current) return
    drawOverlay(canvas, cropBox)
  }, [cropBox])

  useEffect(() => {
    if (!imageEl || !cropBox || !displaySize) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const scale = imageEl.naturalWidth / displaySize.w
        const blob = await cropImage(imageEl, cropBox, scale, outputFormat, quality / 100)
        const url = URL.createObjectURL(blob)
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
        setPreviewSize(blob.size)
      } catch {
        // 미리보기 실패 무시
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [imageEl, cropBox, outputFormat, quality, displaySize])

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      const img = new Image()
      img.onload = () => handleFileLoad(img, url)
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
    setError(null)
    const containerW = containerRef.current?.clientWidth ?? 700
    const maxH = 560
    const scale = Math.min(containerW / img.naturalWidth, maxH / img.naturalHeight, 1)
    const displayW = Math.round(img.naturalWidth * scale)
    const displayH = Math.round(img.naturalHeight * scale)
    setDisplaySize({ w: displayW, h: displayH })
    setCropBox({ x: 0, y: 0, w: displayW, h: displayH })
    setAspectRatio(null)
  }

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
    let newW = cropBox.w
    let newH = newW / ratio
    if (newH > displaySize.h) { newH = displaySize.h; newW = newH * ratio }
    if (newW > displaySize.w) { newW = displaySize.w; newH = newW / ratio }
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

  const cropInfo = imageEl && cropBox && displaySize
    ? `${Math.round(cropBox.w * (imageEl.naturalWidth / displaySize.w))} × ${Math.round(cropBox.h * (imageEl.naturalWidth / displaySize.w))} px`
    : null

  return (
    <div className="space-y-5">
      {/* 파일 input — 항상 존재 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {/* 컨트롤 바 — 이미지 로드된 경우에만 표시 */}
      {imageEl && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* 파일 교체 */}
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFile(file)
            }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${
              isDragging
                ? 'border-[#a78bfa] bg-[#a78bfa10] text-[#a78bfa]'
                : 'border-[#a78bfa40] text-[#a78bfa] hover:border-[#a78bfa60] hover:bg-[#a78bfa08]'
            }`}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="max-w-[160px] truncate">{fileName ?? '파일 교체'}</span>
          </button>

          <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

          {/* 비율 */}
          <div className="flex items-center gap-2">
            <span className={labelCls}>비율</span>
            <div className="flex gap-1.5">
              {ASPECT_PRESETS.map(({ label, value }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => handlePresetChange(value)}
                  className={segBtn(aspectRatio === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

          {/* 출력 포맷 */}
          <div className="flex items-center gap-2">
            <span className={labelCls}>포맷</span>
            <div className="flex gap-1.5">
              {OUTPUT_FORMATS.map(({ label, value }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setOutputFormat(value)}
                  className={segBtn(outputFormat === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 품질 슬라이더 */}
      {outputFormat !== 'image/png' && (
        <div className="flex items-center gap-3">
          <span className={`shrink-0 ${labelCls}`}>품질 {quality}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-[#a78bfa]"
          />
        </div>
      )}

      {/* 캔버스 */}
      <div
        ref={containerRef}
        className="relative min-h-[500px] overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c]"
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full min-h-[500px] w-full cursor-pointer flex-col items-center justify-center gap-3"
          >
            <motion.svg
              className="size-10 text-[#a78bfa44]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </motion.svg>
            <p className="text-sm text-[#777]">클릭하거나 드래그해서 이미지 업로드</p>
            <p className="text-xs text-[#444]">자유롭게 크롭하고 비율을 조정하세요</p>
          </button>
        )}
      </div>

      {/* 하단: 미리보기 + 정보 */}
      {(previewUrl || cropInfo || previewSize !== null) && (
        <div className="flex items-center gap-4 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          {previewUrl && (
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[10px] border border-[#ffffff15] bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="크롭 미리보기" className="h-full w-full object-contain" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {cropInfo && (
              <p className="font-mono text-xs text-[#a78bfa]">{cropInfo}</p>
            )}
            {previewSize !== null && (
              <p className="text-[11px] text-[#555]">
                예상 크기{' '}
                <span className="font-mono text-[#bbb]">
                  {previewSize >= 1024 * 1024
                    ? `${(previewSize / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(previewSize / 1024)} KB`}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* 다운로드 */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={handleDownload}
          disabled={!imageEl || isConverting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConverting ? (
            '처리 중…'
          ) : (
            <>
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
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}
