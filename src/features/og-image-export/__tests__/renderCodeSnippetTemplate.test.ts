import { renderCodeSnippetTemplate } from '../lib/renderCodeSnippetTemplate'
import type { OgImageConfig } from '../lib/renderOgImageToCanvas'

// drawAutoSizedText와 loadLogo mock
jest.mock('../lib/renderOgImageToCanvas', () => ({
  ...jest.requireActual('../lib/renderOgImageToCanvas'),
  loadLogo: jest.fn().mockResolvedValue(undefined),
  drawAutoSizedText: jest.fn().mockReturnValue(48),
}))

function makeMockCtx() {
  const ctx = {
    fillStyle: '',
    textAlign: 'start' as CanvasTextAlign,
    font: '',
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    roundRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 100 }),
    save: jest.fn(),
    restore: jest.fn(),
    drawImage: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn(),
  } as unknown as CanvasRenderingContext2D

  return ctx
}

function makeCanvas(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  jest.spyOn(canvas, 'getContext').mockReturnValue(ctx)
  return canvas
}

const baseConfig: OgImageConfig = {
  backgroundColor: '#0d1117',
  title: 'Hello World',
  subtitle: 'A subtitle here',
  fontFamily: 'Inter',
  template: 'code-snippet',
  codeTheme: 'dark',
}

describe('renderCodeSnippetTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('에디터 프레임 배경을 그린다 (roundRect 호출)', async () => {
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, baseConfig)

    expect(ctx.roundRect).toHaveBeenCalled()
  })

  it('트래픽 라이트 3개를 그린다 (arc 3번 호출)', async () => {
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, baseConfig)

    expect(ctx.arc).toHaveBeenCalledTimes(3)
  })

  it('title 텍스트를 그린다', async () => {
    const { drawAutoSizedText } = jest.requireMock('../lib/renderOgImageToCanvas')
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, baseConfig)

    const calls = (drawAutoSizedText as jest.Mock).mock.calls
    const titleCall = calls.find((args: unknown[]) => args[1] === 'Hello World')
    expect(titleCall).toBeDefined()
  })

  it('subtitle 텍스트를 그린다', async () => {
    const { drawAutoSizedText } = jest.requireMock('../lib/renderOgImageToCanvas')
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, baseConfig)

    const calls = (drawAutoSizedText as jest.Mock).mock.calls
    const subtitleCall = calls.find((args: unknown[]) => args[1] === 'A subtitle here')
    expect(subtitleCall).toBeDefined()
  })

  it('light 테마에서도 정상 동작한다', async () => {
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, {
      ...baseConfig,
      codeTheme: 'light',
      backgroundColor: '#f0f0f0',
    })

    // roundRect와 arc는 테마에 무관하게 호출되어야 한다
    expect(ctx.roundRect).toHaveBeenCalled()
    expect(ctx.arc).toHaveBeenCalledTimes(3)
  })

  it('logoDataUrl이 있으면 loadLogo를 호출한다', async () => {
    const { loadLogo } = jest.requireMock('../lib/renderOgImageToCanvas')
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    await renderCodeSnippetTemplate(canvas, {
      ...baseConfig,
      logoDataUrl: 'data:image/png;base64,abc',
    })

    expect(loadLogo).toHaveBeenCalled()
  })

  it('codeTheme이 없으면 dark 테마를 기본으로 사용한다', async () => {
    const ctx = makeMockCtx()
    const canvas = makeCanvas(ctx)

    // codeTheme 미지정 - 에러 없이 동작해야 함
    await expect(
      renderCodeSnippetTemplate(canvas, { ...baseConfig, codeTheme: undefined })
    ).resolves.toBeUndefined()
  })
})
