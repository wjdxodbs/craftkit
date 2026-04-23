import { SignatureMaker } from "@/widgets/signature-maker/ui/SignatureMaker";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function SignatureMakerToolView() {
  return (
    <ToolPageLayout toolId="signature-maker" fullHeight>
      <SignatureMaker />
    </ToolPageLayout>
  );
}
