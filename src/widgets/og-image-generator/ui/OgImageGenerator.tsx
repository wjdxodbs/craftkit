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
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
            배경색
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setConfig((c) => ({ ...c, backgroundColor: color }))}
                className={`h-6 w-6 rounded transition-transform hover:scale-110 ${
                  config.backgroundColor === color
                    ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-[#0d0d1a]'
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
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
            로고 (선택)
          </label>
          <ImageUpload
            onFileLoad={(_, url) => setLogoDataUrl(url)}
            accept="image/png,image/svg+xml,image/webp"
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
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
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
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
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
            폰트
          </label>
          <div className="flex gap-2">
            {FONTS.map((font) => (
              <button
                key={font}
                onClick={() => setConfig((c) => ({ ...c, fontFamily: font }))}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  config.fontFamily === font
                    ? 'border border-violet-500 bg-violet-600/20 text-violet-300'
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
          <label className="mb-2 block text-xs uppercase tracking-widest text-white/40">
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
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
          >
            {isDownloading ? '생성 중...' : '⬇ Download PNG'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
