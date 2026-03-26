import { describe, it, expect } from 'vitest'
import { unzipSync } from 'fflate'
import { generateFavicons } from '../lib/generateFavicons'

describe('generateFavicons', () => {
  it('ZIP을 반환한다', async () => {
    const img = document.createElement('img')
    const result = await generateFavicons(img)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('ZIP에 favicon.ico가 포함된다', async () => {
    const img = document.createElement('img')
    const zip = await generateFavicons(img)
    const extracted = unzipSync(zip)
    expect(extracted['favicon.ico']).toBeDefined()
  })

  it('ZIP에 모든 PNG 파일이 포함된다', async () => {
    const img = document.createElement('img')
    const zip = await generateFavicons(img)
    const extracted = unzipSync(zip)

    expect(extracted['favicon-16x16.png']).toBeDefined()
    expect(extracted['favicon-32x32.png']).toBeDefined()
    expect(extracted['apple-touch-icon.png']).toBeDefined()
    expect(extracted['android-chrome-192x192.png']).toBeDefined()
    expect(extracted['android-chrome-512x512.png']).toBeDefined()
  })

  it('ZIP에 manifest.json이 포함된다', async () => {
    const img = document.createElement('img')
    const zip = await generateFavicons(img)
    const extracted = unzipSync(zip)
    const manifest = JSON.parse(new TextDecoder().decode(extracted['manifest.json']))
    expect(manifest.icons).toHaveLength(2)
  })
})
