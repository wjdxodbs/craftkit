interface ToolHeaderProps {
  icon: string
  name: string
  description: string
  accentColor: string
}

export function ToolHeader({ name }: ToolHeaderProps) {
  return (
    <h1 className="mb-8 border-l-2 border-primary/60 pl-3 text-2xl font-bold text-foreground">
      {name}
    </h1>
  )
}
