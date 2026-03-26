
import { generateOgImage, type OgImageConfig } from '../lib/generateOgImage'

const baseConfig: OgImageConfig = {
  backgroundColor: '#0f172a',
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  fontFamily: 'Inter',
}

describe('generateOgImage', () => {
  it('Blob을 반환한다', async () => {
    const result = await generateOgImage(baseConfig)
    expect(result).toBeInstanceOf(Blob)
  })

  it('image/png 타입이다', async () => {
    const result = await generateOgImage(baseConfig)
    expect(result.type).toBe('image/png')
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
