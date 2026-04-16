import { ColorConverter } from '@/widgets/color-converter/ui/ColorConverter'
import { ToolHeader } from '@/shared/ui/ToolHeader'
import { TOOLS } from '@/shared/config/tools'

export function ColorConverterToolView() {
  const tool = TOOLS.find((t) => t.id === 'color-converter')
  if (!tool) return null
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16">
      <ToolHeader name={tool.name} description={tool.description} accentColor={tool.accentColor} />
      <ColorConverter />
    </div>
  )
}
