'use client'
import { useRef, useState } from 'react'

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
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = () => onFileLoad(img, dataUrl)
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <button
      aria-label="이미지 업로드"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex h-[120px] w-full overflow-hidden flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed px-6 text-center transition-colors ${
        isDragging
          ? 'border-amber-400 bg-white/[0.08]'
          : 'border-primary/20 bg-primary/[0.03] hover:border-primary/30'
      }`}
    >
      {fileName ? (
        <>
          <p className="w-full truncate text-sm text-white/70">{fileName}</p>
          <p className="mt-1 text-xs text-white/30">클릭하여 변경</p>
        </>
      ) : (
        <>
          <svg
            className="mx-auto mb-3 h-8 w-8 text-amber-400/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-amber-400">클릭하거나 드래그해서 이미지 업로드</p>
          <p className="mt-1 text-xs text-white/20">
            PNG, JPG, SVG, WebP — 권장: 512×512 이상
          </p>
        </>
      )}
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
    </button>
  )
}
