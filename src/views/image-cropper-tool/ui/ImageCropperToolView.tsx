import { ImageCropper } from '@/widgets/image-cropper/ui/ImageCropper'
import { ToolHeader } from '@/shared/ui/ToolHeader'
import { TOOLS } from '@/shared/config/tools'

export function ImageCropperToolView() {
  const tool = TOOLS.find((t) => t.id === 'image-cropper')
  if (!tool) return null
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16">
      <ToolHeader name={tool.name} description={tool.description} accentColor={tool.accentColor} />
      <ImageCropper />
    </div>
  )
}
