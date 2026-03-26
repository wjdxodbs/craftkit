'use client'
import { useRef, useState, useCallback } from 'react'

interface Props {
  onFileLoad: (img: HTMLImageElement, dataUrl: string) => void
  accept?: string
}

export function ImageUpload({
  onFileLoad,
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => onFileLoad(img, dataUrl)
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [onFileLoad]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      role="button"
      aria-label="이미지 업로드"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? 'border-amber-400 bg-white/[0.08]'
          : 'border-white/20 bg-white/[0.04] hover:border-white/30'
      }`}
    >
      <p className="text-sm text-amber-400">클릭하거나 드래그해서 이미지 업로드</p>
      <p className="mt-1 text-xs text-white/20">
        PNG, JPG, SVG, WebP — 권장: 512×512 이상
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
