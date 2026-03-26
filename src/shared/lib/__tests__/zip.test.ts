
import { unzipSync } from 'fflate'
import { createZip } from '../zip'

describe('createZip', () => {
  it('파일을 포함한 유효한 ZIP을 생성한다', () => {
    const files = {
      'test.txt': new Uint8Array(new TextEncoder().encode('hello')),
      'image.png': new Uint8Array([1, 2, 3]),
    }

    const zip = createZip(files)
    const extracted = unzipSync(zip)

    expect(new TextDecoder().decode(extracted['test.txt'])).toBe('hello')
    expect(extracted['image.png']).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('문자열 값도 처리한다', () => {
    const files = { 'manifest.json': '{"name":"test"}' }
    const zip = createZip(files)
    const extracted = unzipSync(zip)
    expect(new TextDecoder().decode(extracted['manifest.json'])).toBe('{"name":"test"}')
  })

  it('Uint8Array를 반환한다', () => {
    const zip = createZip({ 'a.txt': 'hi' })
    expect(zip).toBeInstanceOf(Uint8Array)
  })
})
