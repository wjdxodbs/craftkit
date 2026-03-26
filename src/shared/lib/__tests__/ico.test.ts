
import { encodeIco } from '../ico'

function makeFakePng(size: number): Uint8Array {
  // PNG signature(8) + IHDR chunk header(8) + IHDR data(13) = 29 bytes
  const buf = new Uint8Array(29)
  const view = new DataView(buf.buffer)
  // PNG signature
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47
  buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a
  // IHDR length = 13
  view.setUint32(8, 13)
  // IHDR type "IHDR"
  buf[12] = 0x49; buf[13] = 0x48; buf[14] = 0x44; buf[15] = 0x52
  // width and height
  view.setUint32(16, size)
  view.setUint32(20, size)
  return buf
}

describe('encodeIco', () => {
  it('ICONDIR 헤더가 올바른 count를 포함한다', () => {
    const png1 = makeFakePng(16)
    const png2 = makeFakePng(32)
    const ico = encodeIco([png1, png2])
    const view = new DataView(ico.buffer)

    expect(view.getUint16(0, true)).toBe(0)  // reserved
    expect(view.getUint16(2, true)).toBe(1)  // type ICO
    expect(view.getUint16(4, true)).toBe(2)  // count
  })

  it('PNG 데이터가 올바른 오프셋에 위치한다', () => {
    const png = makeFakePng(16)
    const ico = encodeIco([png])
    const view = new DataView(ico.buffer)

    // 6 header + 16 dir entry = 22
    const dataOffset = view.getUint32(6 + 12, true)
    expect(dataOffset).toBe(22)

    // PNG signature at offset
    expect(ico[22]).toBe(0x89)
    expect(ico[23]).toBe(0x50)
  })

  it('단일 이미지 ICO의 전체 크기가 올바르다', () => {
    const png = makeFakePng(32)
    const ico = encodeIco([png])
    // 6 + 16*1 + png.length = 22 + 29 = 51
    expect(ico.byteLength).toBe(51)
  })
})
