'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { resizeImage } from '@/features/image-resize/lib/resizeImage'
import type { OutputFormat } from '@/features/image-resize/lib/resizeImage'

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

const labelCls = 'text-[11px] font-medium text-[#777]'
const numInputCls =
  'w-20 rounded-[10px] border border-[#ffffff15] bg-[#0a0a0a] px-2.5 py-1.5 text-center text-sm text-[#ddd] placeholder:text-[#444] outline-none transition-colors focus:border-[#a78bfa55] disabled:opacity-30'
const segBtn = (active: boolean) =>
  `cursor-pointer rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? 'border border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]'
      : 'border border-[#ffffff15] text-[#777] hover:border-[#ffffff25] hover:text-[#bbb]'
  }`

const CHECKER_BG = `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='8' height='8' fill='%23111'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%230c0c0c'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23111'/%3E%3C/svg%3E")`

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
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      const img = new Image()
      img.onload = () => {
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
      img.src = url
    }
    reader.readAsDataURL(file)
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
        setPreviewUrl(null)
        setPreviewSize(null)
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
    <div className="space-y-5">
      {/* 파일 input — 항상 존재 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {/* 컨트롤 바 — 이미지 로드된 경우에만 */}
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

          {/* 크기 */}
          <div className="flex items-center gap-2">
            <span className={labelCls}>크기</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={width || ''}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className={numInputCls}
              placeholder="W"
            />
            <button
              onClick={() => setLocked((v) => !v)}
              className={`shrink-0 cursor-pointer rounded-[10px] border px-2 py-1.5 transition-colors ${
                locked
                  ? 'border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]'
                  : 'border-[#ffffff15] text-[#777] hover:border-[#ffffff25] hover:text-[#bbb]'
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
              className={numInputCls}
              placeholder="H"
            />
          </div>

          <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

          {/* 출력 포맷 */}
          <div className="flex items-center gap-2">
            <span className={labelCls}>포맷</span>
            <div className="flex gap-1.5">
              {OUTPUT_FORMATS.map(({ label, value }) => (
                <button
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

      {/* 품질 슬라이더 — 이미지 로드 + PNG 아닐 때 */}
      {imageEl && outputFormat !== 'image/png' && (
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

      {/* 미리보기 영역 */}
      <div
        className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c]"
        style={
          imageEl && previewUrl
            ? { backgroundImage: CHECKER_BG, backgroundSize: '16px 16px' }
            : undefined
        }
      >
        {imageEl && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="미리보기"
            className="max-h-[500px] max-w-full object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFile(file)
            }}
            className={`flex h-full min-h-[500px] w-full cursor-pointer flex-col items-center justify-center gap-3 transition-colors ${
              isDragging ? 'bg-[#a78bfa08]' : ''
            }`}
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
            <p className="text-xs text-[#444]">PNG, JPG, WebP, SVG, AVIF — 최대 8192px</p>
          </button>
        )}
      </div>

      {/* 하단 정보 바 — 이미지 로드된 경우에만 */}
      {imageEl && naturalSize && (
        <div className="flex items-center justify-between rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          <span className="font-mono text-xs text-[#a78bfa]">
            {naturalSize.w === width && naturalSize.h === height
              ? `${naturalSize.w} × ${naturalSize.h} (원본 유지)`
              : `${naturalSize.w} × ${naturalSize.h} → ${width} × ${height}`}
          </span>
          {previewSize !== null && (
            <span className="font-mono text-xs text-[#bbb]">
              {previewSize >= 1024 * 1024
                ? `${(previewSize / 1024 / 1024).toFixed(1)} MB`
                : `${Math.round(previewSize / 1024)} KB`}
            </span>
          )}
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
