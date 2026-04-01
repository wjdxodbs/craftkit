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

// ── OKLCH (Task 4에서 구현) ───────────────────────────
function parseOklch(_input: string): RGB | null {
  return null
}

function toOklchString(_rgb: RGB): string {
  return ''
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
