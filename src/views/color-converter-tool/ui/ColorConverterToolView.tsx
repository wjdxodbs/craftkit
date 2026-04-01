import { ColorConverter } from '@/widgets/color-converter/ui/ColorConverter'

export function ColorConverterToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 border-l-2 border-violet-500/60 pl-3 text-2xl font-bold text-foreground">
        Color Format Converter
      </h1>
      <ColorConverter />
    </div>
  )
}
