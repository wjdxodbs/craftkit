import { OgImageGenerator } from "@/widgets/og-image-generator/ui/OgImageGenerator";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function OgImageToolView() {
  return (
    <ToolPageLayout toolId="og-image">
      <OgImageGenerator />
    </ToolPageLayout>
  );
}
