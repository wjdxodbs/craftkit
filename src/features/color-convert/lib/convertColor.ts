import { detectFormat } from './detectFormat'

export interface RGB { r: number; g: number; b: number }

export interface ColorResult {
  hex: string
  rgb: string
  hsl: string
  oklch: string
}

// ── HEX ──────────────────────────────────────────────
function parseHex(input: string): RGB | null {
  const raw = input.trim().replace(/^#/, '')
  const expanded = raw.length === 3
    ? raw.split('').map((c) => c + c).join('')
    : raw
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  }
}

function toHex(rgb: RGB): string {
  return '#' + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

// ── RGB ──────────────────────────────────────────────
function parseRgb(input: string): RGB | null {
  const match = input.match(/rgb\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*\)/i)
  if (!match) return null
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  if ([r, g, b].some((v) => v < 0 || v > 255)) return null
  return { r, g, b }
}

function toRgbString(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

// ── HSL ──────────────────────────────────────────────
function hslChannelToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function parseHsl(input: string): RGB | null {
  const match = input.match(/hsl\(\s*([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%\s*\)/i)
  if (!match) return null
  const h = parseFloat(match[1]) / 360
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hslChannelToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hslChannelToRgb(p, q, h) * 255),
    b: Math.round(hslChannelToRgb(p, q, h - 1 / 3) * 255),
  }
}

function toHslString(rgb: RGB): string {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    default: h = ((r - g) / d + 4) / 6
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

// ── OKLCH ─────────────────────────────────────────────
function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function parseOklch(input: string): RGB | null {
  const match = input.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i)
  if (!match) return null
  const L = parseFloat(match[1])
  const C = parseFloat(match[2])
  const H = parseFloat(match[3])

  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bv = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  return {
    r: Math.round(Math.max(0, Math.min(255, delinearize(r) * 255))),
    g: Math.round(Math.max(0, Math.min(255, delinearize(g) * 255))),
    b: Math.round(Math.max(0, Math.min(255, delinearize(bv) * 255))),
  }
}

function toOklchString(rgb: RGB): string {
  const r = linearize(rgb.r / 255)
  const g = linearize(rgb.g / 255)
  const b = linearize(rgb.b / 255)

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  const C = Math.sqrt(a * a + bVal * bVal)
  let H = (Math.atan2(bVal, a) * 180) / Math.PI
  if (H < 0) H += 360

  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(H)})`
}

// ── Core ──────────────────────────────────────────────
function parseToRgb(input: string): RGB | null {
  const format = detectFormat(input)
  if (!format) return null
  switch (format) {
    case 'hex': return parseHex(input)
    case 'rgb': return parseRgb(input)
    case 'hsl': return parseHsl(input)
    case 'oklch': return parseOklch(input)
  }
}

export function convertColor(input: string): ColorResult | null {
  const rgb = parseToRgb(input)
  if (!rgb) return null
  return {
    hex: toHex(rgb),
    rgb: toRgbString(rgb),
    hsl: toHslString(rgb),
    oklch: toOklchString(rgb),
  }
}
