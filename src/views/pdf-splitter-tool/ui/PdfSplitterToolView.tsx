import { PdfSplitter } from "@/widgets/pdf-splitter/ui/PdfSplitter";
import { ToolHeader } from "@/shared/ui/ToolHeader";
import { TOOLS } from "@/shared/config/tools";

export function PdfSplitterToolView() {
  const tool = TOOLS.find((t) => t.id === "pdf-splitter")!;
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16">
      <ToolHeader
        name={tool.name}
        description={tool.description}
        accentColor={tool.accentColor}
      />
      <PdfSplitter />
    </div>
  );
}
