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
    <div>
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
        템플릿
      </p>
      <div className="flex gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
              value === t.id
                ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                : 'border border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
