import { ImageConverter } from '@/widgets/image-converter/ui/ImageConverter'

export function ImageConverterToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 border-l-2 border-amber-500/60 pl-3 text-2xl font-bold text-foreground">
        Image Converter
      </h1>
      <ImageConverter />
    </div>
  )
}
