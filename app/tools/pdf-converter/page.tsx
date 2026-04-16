import type { Metadata } from "next";
import { PdfConverterToolView } from "@/views/pdf-converter-tool/ui/PdfConverterToolView";

export const metadata: Metadata = {
  title: "PDF Converter — Craftkit",
  description:
    "Convert between images and PDF. Image to PDF, PDF to images. No upload, client-side only.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/pdf-converter",
  },
  openGraph: {
    title: "PDF Converter — Craftkit",
    description:
      "Convert between images and PDF. Image to PDF, PDF to images. No upload, client-side only.",
    images: ["/og-image.png"],
  },
};

export default function PdfConverterPage() {
  return <PdfConverterToolView />;
}
