'use client'
import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { usePdfToImage } from './usePdfToImage'
import { OUTPUT_FORMATS } from '@/shared/config/image-formats'
import { labelCls, segBtn } from '@/shared/ui/styles'

export function PdfToImageTab() {
  const {
    fileName,
    pages,
    selectedPages,
    outputFormat,
    quality,
    isConverting,
    error,
    handleFile,
    togglePage,
    selectAll,
    deselectAll,
    setOutputFormat,
    setQuality,
    convert,
  } = usePdfToImage()

  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileInput = (file: File) => {
    handleFile(file)
  }

  return (
    <div className="space-y-5">
      {/* 파일 input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileInput(file)
        }}
      />

      {/* 업로드 영역 — PDF 로드 전 */}
      {pages.length === 0 ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFileInput(file)
            }}
            className={`flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[14px] border border-[#ffffff15] transition-colors ${
              isDragging ? 'bg-[#a78bfa08] border-[#a78bfa40]' : 'bg-[#0c0c0c]'
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </motion.svg>
            <p className="text-sm text-[#777]">클릭하거나 드래그해서 PDF 업로드</p>
            <p className="text-xs text-[#444]">암호화되지 않은 PDF만 지원</p>
          </button>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}
        </div>
      ) : (
        // PDF 로드된 후의 UI
        <div className="space-y-4">
          {/* 파일 정보 및 컨트롤 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#fff]">
                {fileName} ({pages.length}페이지)
              </h3>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
              >
                파일 교체
              </button>
            </div>

            {/* 페이지 선택 컨트롤 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className={segBtn}
              >
                전체
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className={segBtn}
              >
                해제
              </button>
              <span className="text-xs text-[#777]">
                {selectedPages.size} / {pages.length} 선택됨
              </span>
            </div>
          </div>

          {/* 포맷 및 품질 설정 */}
          <div className="space-y-2">
            <label className={labelCls}>포맷</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as Parameters<typeof setOutputFormat>[0])}
              className="w-full rounded-lg border border-[#ffffff15] bg-[#111] px-3 py-2 text-sm text-[#fff] outline-none hover:border-[#ffffff25] focus:border-[#a78bfa40]"
            >
              {OUTPUT_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>품질</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 cursor-pointer"
              />
              <span className="min-w-[40px] text-xs text-[#aaa]">{quality}%</span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}

          {/* 페이지 썸네일 그리드 */}
          <div className="space-y-2">
            <p className="text-xs text-[#777]">페이지 선택</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {pages.map((page) => (
                <button
                  key={page.pageNumber}
                  type="button"
                  onClick={() => togglePage(page.pageNumber)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedPages.has(page.pageNumber)
                      ? 'border-[#a78bfa] bg-[#a78bfa10]'
                      : 'border-[#ffffff15] bg-[#0c0c0c] hover:border-[#ffffff25]'
                  }`}
                >
                  {page.isLoading ? (
                    <div className="aspect-[210/297] flex items-center justify-center bg-[#1a1a1a]">
                      <div className="animate-spin">
                        <svg
                          className="size-4 text-[#a78bfa]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.thumbnailUrl}
                        alt={`페이지 ${page.pageNumber}`}
                        className="aspect-[210/297] w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#00000040]">
                        <span className="text-xs font-semibold text-[#fff]">{page.pageNumber}</span>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 다운로드 버튼 */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              onClick={convert}
              disabled={selectedPages.size === 0 || isConverting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isConverting ? (
                '변환 중…'
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
                  Download ({selectedPages.size})
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
