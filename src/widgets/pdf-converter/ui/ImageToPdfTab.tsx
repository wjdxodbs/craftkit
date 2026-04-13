'use client'
import { useRef } from 'react'
import { Reorder, motion } from 'motion/react'
import { useImageToPdf } from './useImageToPdf'
import type { ImageItem } from './useImageToPdf'

export function ImageToPdfTab() {
  const { items, isConverting, error, addFiles, removeItem, reorder, convert } = useImageToPdf()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) addFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) addFiles(files)
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#ffffff20] bg-[#0c0c0c] transition-colors hover:border-[#a78bfa66] hover:shadow-[0_0_24px_-4px_#a78bfa15]"
      >
        <svg
          className="size-8 text-[#a78bfa44]"
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
        <p className="text-sm text-[#777]">클릭하거나 드래그해서 이미지 추가</p>
        <p className="text-xs text-[#444]">PNG, JPG, WebP 등 — 여러 장 동시 선택 가능</p>
      </button>

      {items.length > 0 && (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={reorder}
          className="space-y-2"
        >
          {items.map((item: ImageItem) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-3 rounded-[12px] border border-[#ffffff15] bg-[#0c0c0c] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-12 w-12 rounded-[8px] object-cover"
                />
                <span className="flex-1 truncate text-sm text-[#bbb]">{item.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[#555] transition-colors hover:text-[#ff6b6b]"
                  aria-label={`${item.file.name} 삭제`}
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={convert}
          disabled={items.length === 0 || isConverting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConverting ? '처리 중…' : `PDF로 변환 · 다운로드 (${items.length}장)`}
        </button>
      </motion.div>
    </div>
  )
}
