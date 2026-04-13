'use client'
import { useRef } from 'react'
import { motion } from 'motion/react'
import { usePdfToImage } from './usePdfToImage'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
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

  const replaceInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-5">
      {/* 업로드 영역 — PDF 로드 전 */}
      {pages.length === 0 ? (
        <div className="flex flex-col gap-4">
          <ImageUpload
            accept="application/pdf"
            hint="암호화되지 않은 PDF만 지원"
            size="lg"
            onFiles={(files) => { if (files[0]) handleFile(files[0]) }}
          />

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
                onClick={() => replaceInputRef.current?.click()}
                className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
              >
                파일 교체
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  if (files[0]) handleFile(files[0])
                  e.target.value = ''
                }}
              />
            </div>

            {/* 페이지 선택 컨트롤 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className={segBtn(false)}
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className={segBtn(false)}
              >
                전체 해제
              </button>
              <span className="text-xs text-[#777]">
                {selectedPages.size} / {pages.length} 선택됨
              </span>
            </div>
          </div>

          {/* 포맷 및 품질 설정 */}
          <div className="space-y-3 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
            <div className="space-y-2">
              <p className={labelCls}>출력 포맷</p>
              <div className="flex gap-2">
                {OUTPUT_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={segBtn(outputFormat === f.value)}
                    onClick={() => setOutputFormat(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {outputFormat !== 'image/png' && (
              <div className="space-y-2">
                <p className={labelCls}>품질 {quality}%</p>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[#a78bfa]"
                />
              </div>
            )}
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
                    <div className="aspect-[210/297] animate-shimmer" />
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
