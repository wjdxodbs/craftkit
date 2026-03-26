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

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  // sRGB 상대 휘도 기준 (0.5 이상이면 밝은 색)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

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
  const light = isLightColor(config.backgroundColor)

  // 제목
  ctx.font = `bold 64px ${fontFamily}`
  ctx.fillStyle = light ? '#111111' : '#ffffff'
  ctx.fillText(config.title, 80, H / 2 + 20)

  // 부제목
  ctx.font = `32px ${fontFamily}`
  ctx.fillStyle = light ? '#555555' : '#64748b'
  ctx.fillText(config.subtitle, 80, H / 2 + 80)
}
