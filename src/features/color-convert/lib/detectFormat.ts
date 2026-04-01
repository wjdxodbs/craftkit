export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

export function detectFormat(input: string): ColorFormat | null {
  const trimmed = input.trim()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return 'hex'
  if (/^rgb\s*\(/i.test(trimmed)) return 'rgb'
  if (/^hsl\s*\(/i.test(trimmed)) return 'hsl'
  if (/^oklch\s*\(/i.test(trimmed)) return 'oklch'
  return null
}
