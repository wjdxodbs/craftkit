import {
  type OgImageConfig,
  FONT_MAP,
  W,
  H,
  loadLogo,
  drawAutoSizedText,
} from './renderOgImageToCanvas'

const THEME_COLORS = {
  dark: {
    outerBg: '#0d1117',
    editorBg: '#161b22',
    titleBarBg: '#1c2128',
    textColor: '#e6edf3',
    subTextColor: '#7d8590',
  },
  light: {
    outerBg: '#f0f0f0',
    editorBg: '#ffffff',
    titleBarBg: '#f6f8fa',
    textColor: '#1f2328',
    subTextColor: '#656d76',
  },
}

const TRAFFIC_LIGHTS = [
  { color: '#ff5f57' },
  { color: '#febc2e' },
  { color: '#28c840' },
]

const FRAME_PADDING = 60
const TITLE_BAR_H = 44
const TRAFFIC_RADIUS = 6
const TRAFFIC_SPACING = 22

export async function renderCodeSnippetTemplate(
  canvas: HTMLCanvasElement,
  config: OgImageConfig
): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const theme = config.codeTheme ?? 'dark'
  const colors = THEME_COLORS[theme]
  const monoFont = FONT_MAP.Mono

  // 외부 배경
  ctx.fillStyle = colors.outerBg
  ctx.fillRect(0, 0, W, H)

  // 에디터 프레임 위치 계산
  const frameX = FRAME_PADDING
  const frameY = FRAME_PADDING
  const frameW = W - FRAME_PADDING * 2
  const frameH = H - FRAME_PADDING * 2
  const frameRadius = 12

  // 에디터 프레임 배경
  ctx.fillStyle = colors.editorBg
  ctx.beginPath()
  ctx.roundRect(frameX, frameY, frameW, frameH, frameRadius)
  ctx.fill()

  // 타이틀 바
  ctx.fillStyle = colors.titleBarBg
  ctx.beginPath()
  ctx.roundRect(frameX, frameY, frameW, TITLE_BAR_H, [frameRadius, frameRadius, 0, 0])
  ctx.fill()

  // 트래픽 라이트 (타이틀 바 좌측)
  const trafficStartX = frameX + 20
  const trafficY = frameY + TITLE_BAR_H / 2

  TRAFFIC_LIGHTS.forEach(({ color }, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(trafficStartX + i * TRAFFIC_SPACING, trafficY, TRAFFIC_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  })

  // 에디터 콘텐츠 영역
  const contentX = frameX + 60
  const contentH = frameH - TITLE_BAR_H
  const maxTextWidth = frameW - 120

  // 로고 + 텍스트 배치
  const logoSize = 64
  const logoGap = 24
  let textX = contentX

  if (config.logoDataUrl) {
    const logoY = frameY + TITLE_BAR_H + contentH / 2 - logoSize / 2 - 30
    await loadLogo(ctx, config.logoDataUrl, contentX, logoY, logoSize, logoSize)
    textX = contentX + logoSize + logoGap
  }

  const titleY = frameY + TITLE_BAR_H + contentH / 2
  const titleSize = drawAutoSizedText(
    ctx,
    config.title,
    textX,
    titleY,
    maxTextWidth,
    56,
    20,
    'bold',
    monoFont,
    colors.textColor
  )

  drawAutoSizedText(
    ctx,
    config.subtitle,
    textX,
    titleY + titleSize + 20,
    maxTextWidth,
    28,
    14,
    'normal',
    monoFont,
    colors.subTextColor
  )
}
