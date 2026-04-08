
import { generateOgImage, type OgImageConfig } from '../lib/generateOgImage'

const baseConfig: OgImageConfig = {
  backgroundColor: '#0f172a',
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  fontFamily: 'Inter',
  template: 'classic',
}

describe('generateOgImage', () => {
  it('Classic 템플릿 — Blob을 반환한다', async () => {
    const result = await generateOgImage(baseConfig)
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/png')
  })

  it('Gradient 템플릿 — Blob을 반환한다', async () => {
    const config: OgImageConfig = {
      ...baseConfig,
      template: 'gradient',
      gradientColor2: '#ec4899',
      gradientAngle: 45,
    }
    const result = await generateOgImage(config)
    expect(result).toBeInstanceOf(Blob)
  })

  it('Code Snippet 템플릿 — Blob을 반환한다', async () => {
    const config: OgImageConfig = {
      ...baseConfig,
      template: 'code-snippet',
      codeTheme: 'dark',
      filePath: 'src/index.ts',
    }
    const result = await generateOgImage(config)
    expect(result).toBeInstanceOf(Blob)
  })

  it('logoDataUrl이 없어도 동작한다', async () => {
    await expect(generateOgImage(baseConfig)).resolves.toBeInstanceOf(Blob)
  })

  it('logoDataUrl이 있어도 동작한다', async () => {
    const config: OgImageConfig = {
      ...baseConfig,
      logoDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
    }
    await expect(generateOgImage(config)).resolves.toBeInstanceOf(Blob)
  })
})
