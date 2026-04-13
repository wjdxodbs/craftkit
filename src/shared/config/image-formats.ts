export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export const OUTPUT_FORMATS: { label: string; value: OutputFormat }[] = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
]

export const EXT_MAP: Record<OutputFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}
