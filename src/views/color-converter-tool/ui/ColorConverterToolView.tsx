import { ColorConverter } from "@/widgets/color-converter/ui/ColorConverter";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function ColorConverterToolView() {
  return (
    <ToolPageLayout toolId="color-converter">
      <ColorConverter />
    </ToolPageLayout>
  );
}
