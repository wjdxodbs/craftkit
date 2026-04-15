import type { Metadata } from "next";
import { PdfWatermarkToolView } from "@/views/pdf-watermark-tool/ui/PdfWatermarkToolView";

export const metadata: Metadata = {
  title: "PDF Watermark — Craftkit",
  description: "PDF에 텍스트 워터마크 추가. 브라우저에서 처리, 업로드 없음.",
  openGraph: {
    title: "PDF Watermark — Craftkit",
    description: "PDF에 텍스트 워터마크 추가. 브라우저에서 처리, 업로드 없음.",
    images: ["/og-image.png"],
  },
};

export default function PdfWatermarkPage() {
  return <PdfWatermarkToolView />;
}
