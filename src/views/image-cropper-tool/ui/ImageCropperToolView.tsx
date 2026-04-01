import { ImageCropper } from '@/widgets/image-cropper/ui/ImageCropper'

export function ImageCropperToolView() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 border-l-2 border-amber-500/60 pl-3 text-2xl font-bold text-foreground">
        Image Cropper
      </h1>
      <ImageCropper />
    </div>
  )
}
