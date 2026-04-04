interface ToolHeaderProps {
  icon: string
  name: string
  description: string
  accentColor: string
}

export function ToolHeader({ name, description, accentColor }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
        {name}
      </h1>
      <p className="mt-1.5 text-sm text-white/40">{description}</p>
      <div className="mt-5 h-[3px]" style={{ background: accentColor }} />
    </div>
  )
}
