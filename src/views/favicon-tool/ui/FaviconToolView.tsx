import { FaviconGenerator } from "@/widgets/favicon-generator/ui/FaviconGenerator";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function FaviconToolView() {
  return (
    <ToolPageLayout toolId="favicon">
      <FaviconGenerator />
    </ToolPageLayout>
  );
}
