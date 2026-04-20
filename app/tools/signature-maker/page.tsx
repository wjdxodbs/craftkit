import type { Metadata } from "next";
import { SignatureMakerToolView } from "@/views/signature-maker-tool/ui/SignatureMakerToolView";

export const metadata: Metadata = {
  title: "Signature Maker — Craftkit",
  description:
    "Draw your signature and download as a transparent PNG. No upload.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/signature-maker",
  },
  openGraph: {
    title: "Signature Maker — Craftkit",
    description:
      "Draw your signature and download as a transparent PNG. No upload.",
    images: ["/og-image.png"],
  },
};

export default function SignatureMakerPage() {
  return <SignatureMakerToolView />;
}
