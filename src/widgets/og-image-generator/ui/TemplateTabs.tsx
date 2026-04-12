import type { TemplateName } from '@/features/og-image-export/lib/renderOgImageToCanvas'

const TEMPLATES: { id: TemplateName; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'code-snippet', label: 'Code' },
]

interface Props {
  value: TemplateName
  onChange: (template: TemplateName) => void
}

export function TemplateTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`cursor-pointer rounded-[10px] px-3.5 py-1.5 text-xs font-medium transition-colors ${
            value === t.id
              ? 'border border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]'
              : 'border border-[#ffffff15] text-[#777] hover:border-[#ffffff25] hover:text-[#bbb]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
