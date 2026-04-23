import { PdfEncryptor } from "@/widgets/pdf-encryptor/ui/PdfEncryptor";
import { ToolPageLayout } from "@/shared/ui/ToolPageLayout";

export function PdfEncryptorToolView() {
  return (
    <ToolPageLayout toolId="pdf-password">
      <PdfEncryptor />
    </ToolPageLayout>
  );
}
