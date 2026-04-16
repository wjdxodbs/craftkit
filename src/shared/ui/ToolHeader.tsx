interface ToolHeaderProps {
  name: string
  description: string
  accentColor: string
}

export function ToolHeader({ name, description, accentColor }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
        {name}
      </h1>
      <p className="mt-1.5 text-sm text-[#888]">{description}</p>
      <div
        className="mt-5 h-px"
        style={{ background: `linear-gradient(90deg, ${accentColor}50, ${accentColor}20, transparent)` }}
      />
    </div>
  )
}
