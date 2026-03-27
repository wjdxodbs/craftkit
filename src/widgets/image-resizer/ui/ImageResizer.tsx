'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { resizeImage } from '@/features/image-resize/lib/resizeImage'
import type { OutputFormat } from '@/features/image-resize/lib/resizeImage'
import { Button } from '@/shared/ui/button'

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

export function ImageResizer() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [locked, setLocked] = useState(true)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
    const w = img.naturalWidth || 1
    const h = img.naturalHeight || 1
    setNaturalSize({ w, h })
    setWidth(w)
    setHeight(h)
    setLocked(true)
  }

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, Math.min(8192, val))
    setWidth(w)
    if (locked && naturalSize) {
      setHeight(Math.round(w / (naturalSize.w / naturalSize.h)))
    }
  }

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, Math.min(8192, val))
    setHeight(h)
    if (locked && naturalSize) {
      setWidth(Math.round(h * (naturalSize.w / naturalSize.h)))
    }
  }

  const handleDownload = async () => {
    if (!imageEl) return
    setIsConverting(true)
    try {
      const blob = await resizeImage(imageEl, width, height, outputFormat, quality / 100)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resized.${EXT_MAP[outputFormat]}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 좌측: 컨트롤 */}
      <div className="space-y-5">
        {/* 이미지 업로드 */}
        <div>
          <ImageUpload
            onFileLoad={handleFileLoad}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
          />
          {naturalSize && (
            <p className="mt-2 text-xs">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-300">
                원본: {naturalSize.w} × {naturalSize.h}
              </span>
            </p>
          )}
        </div>

        {/* 크기 입력 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">크기 (px)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={8192}
              value={width || ''}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              disabled={!imageEl}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none disabled:opacity-30"
              placeholder="W"
            />
            <button
              onClick={() => setLocked((v) => !v)}
              disabled={!imageEl}
              className={`shrink-0 rounded-lg border px-2 py-1.5 text-sm transition-colors disabled:opacity-30 ${
                locked
                  ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                  : 'border-white/10 text-white/40 hover:border-white/20'
              }`}
              title={locked ? '비율 잠금 켜짐' : '비율 잠금 꺼짐'}
            >
              {locked ? '🔒' : '🔓'}
            </button>
            <input
              type="number"
              min={1}
              max={8192}
              value={height || ''}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              disabled={!imageEl}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none disabled:opacity-30"
              placeholder="H"
            />
          </div>
        </div>

        {/* 출력 포맷 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">출력 포맷</label>
          <div className="flex gap-2">
            {OUTPUT_FORMATS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setOutputFormat(value)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
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
            <label className="mb-2 block text-xs text-white/50">
              품질 {quality}%
            </label>
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

        {/* 변환 요약 */}
        <p className="text-xs text-white/30">
          {imageEl && naturalSize
            ? `${naturalSize.w} × ${naturalSize.h} → ${width} × ${height}`
            : '이미지를 업로드하면 크기를 조절할 수 있습니다'}
        </p>
      </div>

      {/* 우측: 미리보기 + 다운로드 */}
      <div className="space-y-4">
        <div
          className="flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.08]"
          style={{ aspectRatio: '1 / 1' }}
        >
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="미리보기"
              className="h-full w-full object-contain"
            />
          ) : (
            <p className="text-xs text-white/20">미리보기</p>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            disabled={!imageEl || isConverting}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40"
          >
            {isConverting ? '처리 중...' : '⬇ Download'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
