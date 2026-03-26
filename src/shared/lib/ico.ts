export function encodeIco(pngBuffers: Uint8Array[]): Uint8Array {
  const count = pngBuffers.length
  const headerSize = 6 + 16 * count
  const totalSize =
    headerSize + pngBuffers.reduce((acc, buf) => acc + buf.byteLength, 0)

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // ICONDIR header
  view.setUint16(0, 0, true)      // reserved
  view.setUint16(2, 1, true)      // type: ICO
  view.setUint16(4, count, true)  // count

  let dataOffset = headerSize

  pngBuffers.forEach((png, i) => {
    const entryOffset = 6 + i * 16
    const pngView = new DataView(png.buffer, png.byteOffset)
    const width = pngView.getUint32(16)
    const height = pngView.getUint32(20)

    bytes[entryOffset + 0] = width >= 256 ? 0 : width
    bytes[entryOffset + 1] = height >= 256 ? 0 : height
    bytes[entryOffset + 2] = 0  // colorCount
    bytes[entryOffset + 3] = 0  // reserved
    view.setUint16(entryOffset + 4, 1, true)               // planes
    view.setUint16(entryOffset + 6, 32, true)              // bitCount
    view.setUint32(entryOffset + 8, png.byteLength, true)  // size
    view.setUint32(entryOffset + 12, dataOffset, true)     // offset

    bytes.set(png, dataOffset)
    dataOffset += png.byteLength
  })

  return bytes
}
