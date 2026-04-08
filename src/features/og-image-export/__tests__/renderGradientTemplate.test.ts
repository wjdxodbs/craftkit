import { renderGradientTemplate } from '../lib/renderGradientTemplate'
import type { OgImageConfig } from '../lib/renderOgImageToCanvas'

// drawAutoSizedText와 loadLogo mock
jest.mock('../lib/renderOgImageToCanvas', () => ({
  ...jest.requireActual('../lib/renderOgImageToCanvas'),
  loadLogo: jest.fn().mockResolvedValue(undefined),
  drawAutoSizedText: jest.fn().mockReturnValue(64),
}))

function makeMockCtx() {
  const gradient = {
    addColorStop: jest.fn(),
  }

  const ctx = {
    fillStyle: '',
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    textAlign: 'start' as CanvasTextAlign,
    createLinearGradient: jest.fn().mockReturnValue(gradient),
    createRadialGradient: jest.fn().mockReturnValue(gradient),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 0 }),
    drawImage: jest.fn(),
    font: '',
    fillStyle2: '',
  } as unknown as CanvasRenderingContext2D

  return { ctx, gradient }
}

function makeCanvas(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  jest.spyOn(canvas, 'getContext').mockReturnValue(ctx)
  return canvas
}

const baseConfig: OgImageConfig = {
  backgroundColor: '#3b82f6',
  title: 'Hello World',
  subtitle: 'A subtitle here',
  fontFamily: 'Inter',
  template: 'gradient',
}

describe('renderGradientTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createLinearGradient를 호출하여 그라디언트 배경을 그린다', async () => {
    const { ctx } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, baseConfig)

    expect(ctx.createLinearGradient).toHaveBeenCalled()
  })

  it('title 텍스트를 그린다', async () => {
    const { drawAutoSizedText } = jest.requireMock('../lib/renderOgImageToCanvas')
    const { ctx } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, baseConfig)

    const calls = (drawAutoSizedText as jest.Mock).mock.calls
    const titleCall = calls.find((args: unknown[]) => args[1] === 'Hello World')
    expect(titleCall).toBeDefined()
  })

  it('subtitle 텍스트를 그린다', async () => {
    const { drawAutoSizedText } = jest.requireMock('../lib/renderOgImageToCanvas')
    const { ctx } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, baseConfig)

    const calls = (drawAutoSizedText as jest.Mock).mock.calls
    const subtitleCall = calls.find((args: unknown[]) => args[1] === 'A subtitle here')
    expect(subtitleCall).toBeDefined()
  })

  it('gradientColor2가 없으면 자동 밝기 보정으로 두 번째 색을 생성한다', async () => {
    const { ctx, gradient } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, { ...baseConfig, gradientColor2: undefined })

    // addColorStop이 두 번 이상 호출되어 두 색상이 설정됨
    expect(gradient.addColorStop).toHaveBeenCalledWith(0, expect.any(String))
    expect(gradient.addColorStop).toHaveBeenCalledWith(1, expect.any(String))
  })

  it('gradientColor2가 지정되면 해당 색을 두 번째 그라디언트 색으로 사용한다', async () => {
    const { ctx, gradient } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, { ...baseConfig, gradientColor2: '#ec4899' })

    expect(gradient.addColorStop).toHaveBeenCalledWith(1, '#ec4899')
  })

  it('gradientPreset이 sunset이면 프리셋 색상을 사용한다', async () => {
    const { ctx, gradient } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, { ...baseConfig, gradientPreset: 'sunset' })

    expect(gradient.addColorStop).toHaveBeenCalledWith(0, '#f97316')
    expect(gradient.addColorStop).toHaveBeenCalledWith(1, '#ec4899')
  })

  it('logoDataUrl이 있으면 loadLogo를 호출한다', async () => {
    const { loadLogo } = jest.requireMock('../lib/renderOgImageToCanvas')
    const { ctx } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, { ...baseConfig, logoDataUrl: 'data:image/png;base64,abc' })

    expect(loadLogo).toHaveBeenCalled()
  })

  it('함수 종료 후 textAlign이 start로 초기화된다', async () => {
    const { ctx } = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderGradientTemplate(canvas, baseConfig)

    expect(ctx.textAlign).toBe('start')
  })
})
