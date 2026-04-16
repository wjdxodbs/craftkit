'use client'
import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { cropImage } from '@/features/image-crop/lib/cropImage'
import type { CropBox, OutputFormat } from '@/features/image-crop/lib/cropImage'
import { EXT_MAP } from '@/shared/config/image-formats'
import { labelCls } from '@/shared/ui/styles'
import { useDragHandling, clamp, MIN_CROP } from './useDragHandling'
import { useCropPreview } from './useCropPreview'
import { CropControlBar } from './CropControlBar'

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

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDragHandling({
    cropBox,
    canvasRef,
    aspectRatio,
    setCropBox,
  })

  const { previewUrl, previewSize } = useCropPreview({
    imageEl,
    cropBox,
    displaySize,
    outputFormat,
    quality,
  })

  const handleFile = (file: File): void => {
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

  const handleFileLoad = (img: HTMLImageElement, url: string): void => {
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

  const handlePresetChange = (ratio: number | null): void => {
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

  const handleDownload = async (): Promise<void> => {
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
        <CropControlBar
          fileName={fileName}
          isDragging={isDragging}
          aspectRatio={aspectRatio}
          outputFormat={outputFormat}
          onFileReplace={() => inputRef.current?.click()}
          onFileDrop={handleFile}
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onPresetChange={handlePresetChange}
          onFormatChange={setOutputFormat}
        />
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
            <p className="text-xs text-[#888]">자유롭게 크롭하고 비율을 조정하세요</p>
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
              <p className="text-[11px] text-[#888]">
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
