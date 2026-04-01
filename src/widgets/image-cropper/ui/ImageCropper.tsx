'use client'
import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import type { CropBox, OutputFormat } from '@/features/image-crop/lib/cropImage'
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
          <label className="mb-2 block text-xs text-white/50">비율</label>
          <div className="flex gap-2">
            {ASPECT_PRESETS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setAspectRatio(value)}
                disabled={!imageEl}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-30 ${
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
            <label className="mb-2 block text-xs text-white/50">품질 {quality}%</label>
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
            onClick={() => {}}
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
