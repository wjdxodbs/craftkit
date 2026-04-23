import { PdfConverter } from "@/widgets/pdf-converter/ui/PdfConverter";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function PdfConverterToolView() {
  return (
    <ToolPageLayout toolId="pdf-converter">
      <PdfConverter />
    </ToolPageLayout>
  );
}
