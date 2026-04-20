import { SignatureMaker } from "@/widgets/signature-maker/ui/SignatureMaker";
import { ToolHeader } from "@/shared/ui/ToolHeader";
import { TOOLS } from "@/shared/config/tools";

export function SignatureMakerToolView() {
  const tool = TOOLS.find((t) => t.id === "signature-maker");
  if (!tool) return null;
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-6 pb-4 pt-6 sm:block sm:min-h-0 sm:px-10 sm:py-10 md:px-16">
      <ToolHeader
        name={tool.name}
        description={tool.description}
        accentColor={tool.accentColor}
      />
      <SignatureMaker />
    </div>
  );
}
