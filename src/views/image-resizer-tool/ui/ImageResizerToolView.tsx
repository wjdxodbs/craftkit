import { ImageResizer } from '@/widgets/image-resizer/ui/ImageResizer'

export function ImageResizerToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-slate-200">
        Image Resizer
      </h1>
      <ImageResizer />
    </div>
  )
}
