import { detectFormat } from '../lib/detectFormat'
import { convertColor } from '../lib/convertColor'

describe('detectFormat', () => {
  it('#rrggbb 형식을 hex로 감지한다', () => {
    expect(detectFormat('#3b82f6')).toBe('hex')
  })

  it('#rgb 축약 형식을 hex로 감지한다', () => {
    expect(detectFormat('#fff')).toBe('hex')
  })

  it('대문자 HEX를 hex로 감지한다', () => {
    expect(detectFormat('#3B82F6')).toBe('hex')
  })

  it('rgb() 형식을 rgb로 감지한다', () => {
    expect(detectFormat('rgb(59, 130, 246)')).toBe('rgb')
  })

  it('공백 구분 rgb() 형식을 rgb로 감지한다', () => {
    expect(detectFormat('rgb(59 130 246)')).toBe('rgb')
  })

  it('hsl() 형식을 hsl로 감지한다', () => {
    expect(detectFormat('hsl(217, 91%, 60%)')).toBe('hsl')
  })

  it('oklch() 형식을 oklch로 감지한다', () => {
    expect(detectFormat('oklch(0.62 0.2 264)')).toBe('oklch')
  })

  it('잘못된 입력에 null을 반환한다', () => {
    expect(detectFormat('red')).toBeNull()
    expect(detectFormat('123')).toBeNull()
    expect(detectFormat('')).toBeNull()
  })
})

describe('convertColor — HEX 입력', () => {
  it('#3b82f6을 모든 포맷으로 변환한다', () => {
    const result = convertColor('#3b82f6')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#3b82f6')
    expect(result!.rgb).toBe('rgb(59, 130, 246)')
    expect(result!.hsl).toBe('hsl(217, 91%, 60%)')
  })

  it('#fff 축약 HEX를 변환한다', () => {
    const result = convertColor('#fff')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#ffffff')
    expect(result!.rgb).toBe('rgb(255, 255, 255)')
  })
})

describe('convertColor — RGB 입력', () => {
  it('rgb(59, 130, 246)을 변환한다', () => {
    const result = convertColor('rgb(59, 130, 246)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#3b82f6')
  })

  it('공백 구분 rgb(59 130 246)을 변환한다', () => {
    const result = convertColor('rgb(59 130 246)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#3b82f6')
  })
})

describe('convertColor — HSL 입력', () => {
  it('hsl(0, 100%, 50%)을 red로 변환한다', () => {
    const result = convertColor('hsl(0, 100%, 50%)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#ff0000')
    expect(result!.rgb).toBe('rgb(255, 0, 0)')
  })
})

describe('convertColor — 에러 처리', () => {
  it('잘못된 입력에 null을 반환한다', () => {
    expect(convertColor('red')).toBeNull()
    expect(convertColor('')).toBeNull()
    expect(convertColor('123')).toBeNull()
  })
})

describe('convertColor — OKLCH 입력', () => {
  it('oklch(0 0 0)을 black으로 변환한다', () => {
    const result = convertColor('oklch(0 0 0)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#000000')
  })

  it('oklch(1 0 0)을 white로 변환한다', () => {
    const result = convertColor('oklch(1 0 0)')
    expect(result).not.toBeNull()
    expect(result!.hex).toBe('#ffffff')
  })
})

describe('convertColor — OKLCH 출력', () => {
  it('#000000의 oklch는 oklch(0.00 0.00 0)이다', () => {
    const result = convertColor('#000000')
    expect(result).not.toBeNull()
    expect(result!.oklch).toBe('oklch(0.00 0.00 0)')
  })
})
