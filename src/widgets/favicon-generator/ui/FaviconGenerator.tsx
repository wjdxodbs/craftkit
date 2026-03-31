'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { generateFavicons } from '@/features/favicon-export/lib/generateFavicons'
import { downloadBlob } from '@/shared/lib/zip'
import { FAVICON_SIZES } from '@/shared/config/favicon-sizes'
import { Button } from '@/shared/ui/button'

const PREVIEW_SIZES = [16, 32, 180, 512]
const HTML_SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32x32.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">`

export function FaviconGenerator() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFileLoad = (img: HTMLImageElement, url: string) => {
    setImageEl(img)
    setDataUrl(url)
  }

  const handleDownload = async () => {
    if (!imageEl) return
    setIsGenerating(true)
    try {
      const zip = await generateFavicons(imageEl)
      downloadBlob('favicon-package.zip', zip)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(HTML_SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 좌측 */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            1. 파일 업로드
          </h2>
          <ImageUpload onFileLoad={handleFileLoad} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            2. 생성될 파일
          </h2>
          <div className="space-y-2">
            <FileRow filename="favicon.ico" size="16, 32, 48px" />
            {FAVICON_SIZES.map(({ filename, size }) => (
              <FileRow
                key={filename}
                filename={filename}
                size={`${size}×${size}`}
              />
            ))}
            <FileRow filename="manifest.json" size="PWA" />
          </div>
        </div>
      </div>

      {/* 우측 */}
      <div className="space-y-4">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            3. 미리보기
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.08] p-4">
            <div className="flex items-end justify-center gap-4">
              {PREVIEW_SIZES.map((size) => {
                const displaySize = Math.min(size, 48)
                return (
                  <div key={size} className="flex flex-col items-center gap-2">
                    {dataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dataUrl}
                        alt={`${size}px preview`}
                        style={{ width: displaySize, height: displaySize }}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div
                        style={{ width: displaySize, height: displaySize }}
                        className="rounded bg-white/10"
                      />
                    )}
                    <span className="text-[10px] text-white/50">{size}px</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            disabled={!imageEl || isGenerating}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40"
          >
            {isGenerating ? '생성 중…' : (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download ZIP
              </>
            )}
          </Button>
        </motion.div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-white/50">HTML 코드 스니펫</span>
            <button
              onClick={handleCopy}
              className="text-xs text-amber-400 transition-colors hover:text-amber-300"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <pre className="overflow-x-auto text-[10px] leading-relaxed text-amber-400">
            {HTML_SNIPPET}
          </pre>
        </div>
      </div>
    </div>
  )
}

function FileRow({
  filename,
  size,
}: {
  filename: string
  size: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2">
      <span className="text-xs text-slate-200">{filename}</span>
      <span className="text-xs text-white/50">{size}</span>
    </div>
  )
}
