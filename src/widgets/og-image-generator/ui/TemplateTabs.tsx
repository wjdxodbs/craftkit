import type { TemplateName } from "@/features/og-image-export/lib/renderOgImageToCanvas";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

const TEMPLATES: { id: TemplateName; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "gradient", label: "Gradient" },
];

interface Props {
  value: TemplateName;
  onChange: (template: TemplateName) => void;
}

export function TemplateTabs({ value, onChange }: Props) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v: string[]) => {
        const next = v[0] as TemplateName | undefined;
        if (next) onChange(next);
      }}
      spacing={4}
    >
      {TEMPLATES.map((t) => (
        <ToggleGroupItem
          key={t.id}
          value={t.id}
          variant="segment"
          size="seg"
          className="px-3.5"
        >
          {t.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
