'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { generateOgImage } from '@/features/og-image-export/lib/generateOgImage'
import { renderOgImageToCanvas } from '@/features/og-image-export/lib/renderOgImageToCanvas'
import type { OgImageConfig, FontFamily, TemplateName } from '@/features/og-image-export/lib/renderOgImageToCanvas'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { TemplateTabs } from './TemplateTabs'

const PRESET_COLORS = ['#0f172a', '#18181b', '#1e1b4b', '#ffffff']
const GRADIENT_COLORS = ['#0f172a', '#6366f1', '#ec4899', '#f97316', '#10b981', '#ffffff']
const FONTS: FontFamily[] = ['Inter', 'Serif', 'Mono']

export function OgImageGenerator() {
  const [config, setConfig] = useState<OgImageConfig>({
    template: 'classic',
    backgroundColor: '#0f172a',
    title: 'My Awesome Project',
    subtitle: 'A short description of your project',
    fontFamily: 'Inter',
    gradientColor2: '#ec4899',
    gradientAngle: 135,
    codeTheme: 'dark',
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

  const handleTemplateChange = (template: TemplateName) => {
    setConfig((c) => ({ ...c, template }))
  }

  const showFont = config.template !== 'code-snippet'

  return (
    <div className="space-y-6">
      {/* 프리뷰 */}
      <div>
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          미리보기
        </p>
        <div
          className="overflow-hidden rounded-lg border border-white/5 bg-white/[0.04]"
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

      {/* 다운로드 */}
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

      {/* 템플릿 탭 */}
      <TemplateTabs value={config.template ?? 'classic'} onChange={handleTemplateChange} />

      {/* 컨트롤 */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${config.template === 'gradient' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {/* 제목 */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
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
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
            부제목
          </label>
          <Input
            value={config.subtitle}
            onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))}
            className="border-white/10 bg-white/[0.06] text-slate-200 placeholder:text-white/20"
            placeholder="부제목 입력..."
          />
        </div>

        {/* 배경색 — classic 전용 (프리셋 + 커스텀) */}
        {config.template === 'classic' && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              배경색
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig((c) => ({ ...c, backgroundColor: color }))}
                  className={`h-6 w-6 cursor-pointer rounded transition-transform hover:scale-110 ${
                    config.backgroundColor === color
                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]'
                      : ''
                  }`}
                  style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }}
                  aria-label={color}
                />
              ))}
              <label className="relative h-6 w-6 cursor-pointer" title="커스텀 색상">
                <input
                  type="color"
                  value={config.backgroundColor.startsWith('#') ? config.backgroundColor : '#0f172a'}
                  onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                {PRESET_COLORS.includes(config.backgroundColor) ? (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-white/60"
                    style={{ border: '1px dashed rgba(255,255,255,0.2)' }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    className="block h-6 w-6 rounded ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]"
                    style={{ background: config.backgroundColor, border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                )}
              </label>
            </div>
          </div>
        )}

        {/* 폰트 — classic, gradient 전용 */}
        {showFont && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              폰트
            </label>
            <div className="flex gap-2">
              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => setConfig((c) => ({ ...c, fontFamily: font }))}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
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
        )}

        {/* 첫 번째 색상 — gradient 전용 (프리셋 + 커스텀) */}
        {config.template === 'gradient' && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              첫 번째 색상
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {GRADIENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig((c) => ({ ...c, backgroundColor: color }))}
                  className={`h-6 w-6 cursor-pointer rounded transition-transform hover:scale-110 ${
                    config.backgroundColor === color
                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]'
                      : ''
                  }`}
                  style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }}
                  aria-label={`첫 번째 ${color}`}
                />
              ))}
              <label className="relative h-6 w-6 cursor-pointer" title="커스텀 색상">
                <input
                  type="color"
                  value={config.backgroundColor.startsWith('#') ? config.backgroundColor : '#0f172a'}
                  onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                {GRADIENT_COLORS.includes(config.backgroundColor) ? (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-white/60"
                    style={{ border: '1px dashed rgba(255,255,255,0.2)' }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    className="block h-6 w-6 rounded ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]"
                    style={{ background: config.backgroundColor, border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                )}
              </label>
            </div>
          </div>
        )}

        {/* 두 번째 색상 — gradient 전용 (프리셋 + 커스텀) */}
        {config.template === 'gradient' && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              두 번째 색상
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {GRADIENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig((c) => ({ ...c, gradientColor2: color }))}
                  className={`h-6 w-6 cursor-pointer rounded transition-transform hover:scale-110 ${
                    (config.gradientColor2 ?? '#ec4899') === color
                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]'
                      : ''
                  }`}
                  style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }}
                  aria-label={`두 번째 ${color}`}
                />
              ))}
              <label className="relative h-6 w-6 cursor-pointer" title="커스텀 색상">
                <input
                  type="color"
                  value={(config.gradientColor2 ?? '#ec4899').startsWith('#') ? (config.gradientColor2 ?? '#ec4899') : '#ec4899'}
                  onChange={(e) => setConfig((c) => ({ ...c, gradientColor2: e.target.value }))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                {GRADIENT_COLORS.includes(config.gradientColor2 ?? '') ? (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-white/60"
                    style={{ border: '1px dashed rgba(255,255,255,0.2)' }}
                  >
                    +
                  </span>
                ) : (
                  <span
                    className="block h-6 w-6 rounded ring-2 ring-amber-400 ring-offset-1 ring-offset-[#191917]"
                    style={{ background: config.gradientColor2 ?? '#ec4899', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                )}
              </label>
            </div>
          </div>
        )}

        {/* 각도 — gradient 전용 */}
        {config.template === 'gradient' && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              각도: {config.gradientAngle ?? 135}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={config.gradientAngle ?? 135}
              onChange={(e) => setConfig((c) => ({ ...c, gradientAngle: Number(e.target.value) }))}
              className="w-full cursor-pointer accent-amber-500"
            />
          </div>
        )}

        {/* 테마 — code-snippet 전용 */}
        {config.template === 'code-snippet' && (
          <div>
            <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
              테마
            </label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setConfig((c) => ({ ...c, codeTheme: theme }))}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    config.codeTheme === theme
                      ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 로고 */}
      <div>
        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          로고 (선택)
        </label>
        <ImageUpload
          onFileLoad={(_, url) => setLogoDataUrl(url)}
          accept="image/png,image/svg+xml,image/webp"
          hint="PNG, SVG, WebP — 투명 배경 권장"
        />
      </div>
    </div>
  )
}
