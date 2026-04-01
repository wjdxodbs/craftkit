interface ToolHeaderProps {
  icon: string
  name: string
  description: string
  accentColor: string
}

export function ToolHeader({ icon, name, description, accentColor }: ToolHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-xl"
        style={{ background: `${accentColor}18` }}
      >
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-bold leading-none text-foreground">{name}</h1>
        <p className="mt-1 text-xs text-foreground/30">{description}</p>
      </div>
    </div>
  )
}
