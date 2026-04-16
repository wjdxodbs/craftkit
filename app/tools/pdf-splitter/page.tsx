import type { Metadata } from "next";
import { PdfSplitterToolView } from "@/views/pdf-splitter-tool/ui/PdfSplitterToolView";

export const metadata: Metadata = {
  title: "PDF Splitter — Craftkit",
  description: "PDF에서 원하는 페이지만 추출해 새 PDF로 저장",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/pdf-splitter",
  },
  openGraph: {
    title: "PDF Splitter — Craftkit",
    description: "PDF에서 원하는 페이지만 추출해 새 PDF로 저장",
    images: ["/og-image.png"],
  },
};

export default function PdfSplitterPage() {
  return <PdfSplitterToolView />;
}
