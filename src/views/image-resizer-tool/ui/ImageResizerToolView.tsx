import { ImageResizer } from "@/widgets/image-resizer/ui/ImageResizer";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function ImageResizerToolView() {
  return (
    <ToolPageLayout toolId="image-resizer">
      <ImageResizer />
    </ToolPageLayout>
  );
}
