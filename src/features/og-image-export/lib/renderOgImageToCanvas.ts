export type FontFamily = 'Inter' | 'Serif' | 'Mono'

export interface OgImageConfig {
  backgroundColor: string
  title: string
  subtitle: string
  logoDataUrl?: string
  fontFamily: FontFamily
}

const FONT_MAP: Record<FontFamily, string> = {
  Inter: '"Inter", sans-serif',
  Serif: 'Georgia, serif',
  Mono: '"Courier New", monospace',
}

const W = 1200
const H = 630

export async function renderOgImageToCanvas(
  canvas: HTMLCanvasElement,
  config: OgImageConfig
): Promise<void> {
  const ctx = canvas.getContext('2d')!

  // 배경
  ctx.fillStyle = config.backgroundColor
  ctx.fillRect(0, 0, W, H)

  // 로고
  if (config.logoDataUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 80, H / 2 - 160, 80, 80)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = config.logoDataUrl!
    })
  }

  const fontFamily = FONT_MAP[config.fontFamily]

  // 제목
  ctx.font = `bold 64px ${fontFamily}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(config.title, 80, H / 2 + 20)

  // 부제목
  ctx.font = `32px ${fontFamily}`
  ctx.fillStyle = '#64748b'
  ctx.fillText(config.subtitle, 80, H / 2 + 80)
}
