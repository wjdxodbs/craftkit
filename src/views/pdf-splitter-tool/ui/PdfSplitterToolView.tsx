import { PdfSplitter } from "@/widgets/pdf-splitter/ui/PdfSplitter";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function PdfSplitterToolView() {
  return (
    <ToolPageLayout toolId="pdf-splitter">
      <PdfSplitter />
    </ToolPageLayout>
  );
}
