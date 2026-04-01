import { OgImageGenerator } from '@/widgets/og-image-generator/ui/OgImageGenerator'
import { ToolHeader } from '@/shared/ui/ToolHeader'
import { TOOLS } from '@/shared/config/tools'

export function OgImageToolView() {
  const tool = TOOLS.find((t) => t.id === 'og-image')!
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <ToolHeader icon={tool.icon} name={tool.name} description={tool.description} accentColor={tool.accentColor} />
      <OgImageGenerator />
    </div>
  )
}
