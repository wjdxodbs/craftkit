'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { generateOgImage } from '@/features/og-image-export/lib/generateOgImage'
import { renderOgImageToCanvas } from '@/features/og-image-export/lib/renderOgImageToCanvas'
import type { OgImageConfig, FontFamily } from '@/features/og-image-export/lib/renderOgImageToCanvas'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const PRESET_COLORS = ['#0f172a', '#18181b', '#1e1b4b', '#0a0a0a', '#ffffff']
const FONTS: FontFamily[] = ['Inter', 'Serif', 'Mono']

export function OgImageGenerator() {
  const [config, setConfig] = useState<OgImageConfig>({
    backgroundColor: '#0f172a',
    title: 'My Awesome Project',
    subtitle: 'A short description of your project',
    fontFamily: 'Inter',
  })
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>()
  const [isDownloading, setIsDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      renderOgImageToCanvas(canvasRef.current, { ...config, logoDataUrl })
    }
  }, [config, logoDataUrl])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await generateOgImage({ ...config, logoDataUrl })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'og-image.png'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 좌측: 컨트롤 */}
      <div className="space-y-5">
        {/* 배경색 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">
            배경색
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setConfig((c) => ({ ...c, backgroundColor: color }))}
                className={`h-6 w-6 rounded transition-transform hover:scale-110 ${
                  config.backgroundColor === color
                    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]'
                    : ''
                }`}
                style={{
                  background: color,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                aria-label={color}
              />
            ))}
            <input
              type="color"
              value={
                config.backgroundColor.startsWith('#')
                  ? config.backgroundColor
                  : '#0f172a'
              }
              onChange={(e) =>
                setConfig((c) => ({ ...c, backgroundColor: e.target.value }))
              }
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              title="커스텀 색상"
            />
          </div>
        </div>

        {/* 로고 업로드 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">
            로고 (선택)
          </label>
          <ImageUpload
            onFileLoad={(_, url) => setLogoDataUrl(url)}
            accept="image/png,image/svg+xml,image/webp"
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">
            제목
          </label>
          <Input
            value={config.title}
            onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
            className="border-white/10 bg-white/[0.06] text-slate-200 placeholder:text-white/20"
            placeholder="제목을 입력해주세요..."
          />
        </div>

        {/* 부제목 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">
            부제목
          </label>
          <Input
            value={config.subtitle}
            onChange={(e) =>
              setConfig((c) => ({ ...c, subtitle: e.target.value }))
            }
            className="border-white/10 bg-white/[0.06] text-slate-200 placeholder:text-white/20"
            placeholder="부제목 입력..."
          />
        </div>

        {/* 폰트 */}
        <div>
          <label className="mb-2 block text-xs text-white/50">
            폰트
          </label>
          <div className="flex gap-2">
            {FONTS.map((font) => (
              <button
                key={font}
                onClick={() => setConfig((c) => ({ ...c, fontFamily: font }))}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  config.fontFamily === font
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 우측: 미리보기 + 다운로드 */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs text-white/50">
            실시간 미리보기
          </label>
          <div
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.08]"
            style={{ aspectRatio: '1200/630' }}
          >
            <canvas
              ref={canvasRef}
              width={1200}
              height={630}
              className="h-full w-full"
            />
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-amber-500 hover:bg-amber-400"
          >
            {isDownloading ? '생성 중…' : (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
