'use client'
import { useState, useEffect, useRef } from 'react'
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
  const [, setDataUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [locked, setLocked] = useState(true)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
    const w = img.naturalWidth || 1
    const h = img.naturalHeight || 1
    setNaturalSize({ w, h })
    setWidth(w)
    setHeight(h)
    setLocked(true)
    setError(null)
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

  useEffect(() => {
    if (!imageEl || !width || !height) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const blob = await resizeImage(imageEl, width, height, outputFormat, quality / 100)
        const url = URL.createObjectURL(blob)
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
        setPreviewSize(blob.size)
      } catch {
        // 미리보기 실패는 무시
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [imageEl, width, height, outputFormat, quality])

  const handleDownload = async () => {
    if (!imageEl) return
    setIsConverting(true)
    setError(null)
    try {
      const blob = await resizeImage(imageEl, width, height, outputFormat, quality / 100)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resized.${EXT_MAP[outputFormat]}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('변환에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
        {/* 좌측: 컨트롤 */}
        <div className="min-w-0 space-y-5">
          {/* 이미지 업로드 */}
          <div className="overflow-hidden">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">파일 업로드</p>
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
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">크기 (px)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8192}
                value={width || ''}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                disabled={!imageEl}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus-visible:outline-none disabled:opacity-30"
                placeholder="W"
              />
              <button
                onClick={() => setLocked((v) => !v)}
                disabled={!imageEl}
                className={`shrink-0 cursor-pointer rounded-lg border px-2 py-1.5 text-sm transition-colors disabled:opacity-30 ${
                  locked
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
                title={locked ? '비율 잠금 켜짐' : '비율 잠금 꺼짐'}
              >
                {locked ? (
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ) : (
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
              </button>
              <input
                type="number"
                min={1}
                max={8192}
                value={height || ''}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                disabled={!imageEl}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus-visible:outline-none disabled:opacity-30"
                placeholder="H"
              />
            </div>
          </div>

          {/* 출력 포맷 */}
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">출력 포맷</label>
            <div className="flex gap-2">
              {OUTPUT_FORMATS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setOutputFormat(value)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
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
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
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
              ? naturalSize.w === width && naturalSize.h === height
                ? `크기 유지 · ${OUTPUT_FORMATS.find((f) => f.value === outputFormat)?.label} 변환`
                : `${naturalSize.w} × ${naturalSize.h} → ${width} × ${height}`
              : '이미지를 업로드하면 크기를 조절하거나 포맷을 변환할 수 있습니다'}
          </p>
        </div>

        {/* 우측: 미리보기 */}
        <div className="min-w-0 space-y-4">
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">미리보기</p>
            <div
              className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/[0.04]"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="text-xs text-white/20">미리보기</p>
              )}
            </div>
          </div>
          {previewSize !== null && (
            <p className="text-[11px] text-white/40">
              예상 크기:{' '}
              <span className="text-primary">
                {previewSize >= 1024 * 1024
                  ? `${(previewSize / 1024 / 1024).toFixed(1)} MB`
                  : `${Math.round(previewSize / 1024)} KB`}
              </span>
            </p>
          )}
        </div>
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
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
