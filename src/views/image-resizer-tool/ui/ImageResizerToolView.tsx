import { ImageResizer } from '@/widgets/image-resizer/ui/ImageResizer'
import { ToolHeader } from '@/shared/ui/ToolHeader'
import { TOOLS } from '@/shared/config/tools'

export function ImageResizerToolView() {
  const tool = TOOLS.find((t) => t.id === 'image-resizer')!
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16">
      <ToolHeader icon={tool.icon} name={tool.name} description={tool.description} accentColor={tool.accentColor} />
      <ImageResizer />
    </div>
  )
}
