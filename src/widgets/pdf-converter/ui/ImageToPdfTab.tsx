'use client'
import { Reorder, motion } from 'motion/react'
import { useImageToPdf } from './useImageToPdf'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import type { ImageItem } from './useImageToPdf'

export function ImageToPdfTab() {
  const { items, isConverting, error, addFiles, removeItem, reorder, convert } = useImageToPdf()

  return (
    <div className="space-y-5">
      <ImageUpload
        accept="image/*"
        multiple
        hint="PNG, JPG, WebP 등 — 여러 장 동시 선택 가능"
        size="lg"
        onFiles={(files) => addFiles(files.filter((f) => f.type.startsWith('image/')))}
      />

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
