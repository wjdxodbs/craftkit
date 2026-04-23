import { ImageCropper } from "@/widgets/image-cropper/ui/ImageCropper";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function ImageCropperToolView() {
  return (
    <ToolPageLayout toolId="image-cropper">
      <ImageCropper />
    </ToolPageLayout>
  );
}
