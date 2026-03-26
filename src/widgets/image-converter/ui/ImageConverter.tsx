'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { convertImage } from '@/features/image-convert/lib/convertImage'
import type { OutputFormat } from '@/features/image-convert/lib/convertImage'
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

const FORMAT_LABEL: Record<string, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
  'image/avif': 'AVIF',
}

export function ImageConverter() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
    const mime = url.split(';')[0].split(':')[1]
    setDetectedFormat(FORMAT_LABEL[mime] ?? mime)
  }

  const handleDownload = async () => {
    if (!imageEl) return
    setIsConverting(true)
    try {
      const blob = await convertImage(imageEl, outputFormat, quality / 100)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `converted.${EXT_MAP[outputFormat]}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsConverting(false)
    }
  }

  const inputLabel = detectedFormat ?? '?'
  const outputLabel = OUTPUT_FORMATS.find((f) => f.value === outputFormat)?.label ?? ''

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
          {detectedFormat && (
            <p className="mt-2 text-xs">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-300">
                {detectedFormat} 감지됨
              </span>
            </p>
          )}
        </div>

        {/* 출력 포맷 선택 */}
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

        {/* 품질 슬라이더 (JPG/WebP만) */}
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
          {imageEl
            ? `${inputLabel} → ${outputLabel} 변환`
            : '이미지를 업로드하면 변환할 수 있습니다'}
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
            {isConverting ? '변환 중...' : '⬇ Download'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
