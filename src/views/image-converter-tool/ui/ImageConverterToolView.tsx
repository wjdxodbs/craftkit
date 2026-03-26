'use client'
import { ImageConverter } from '@/widgets/image-converter/ui/ImageConverter'

export function ImageConverterToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-slate-200">
        Image Converter
      </h1>
      <ImageConverter />
    </div>
  )
}
