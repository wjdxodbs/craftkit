import { PdfWatermark } from "@/widgets/pdf-watermark/ui/PdfWatermark";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function PdfWatermarkToolView() {
  return (
    <ToolPageLayout toolId="pdf-watermark">
      <PdfWatermark />
    </ToolPageLayout>
  );
}
