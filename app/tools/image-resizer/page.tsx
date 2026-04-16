import type { Metadata } from "next";
import { ImageResizerToolView } from "@/views/image-resizer-tool/ui/ImageResizerToolView";

export const metadata: Metadata = {
  title: "Image Resizer — Craftkit",
  description:
    "Resize and convert PNG, JPG, and WebP images in your browser. No upload.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/image-resizer",
  },
  openGraph: {
    title: "Image Resizer — Craftkit",
    description:
      "Resize and convert PNG, JPG, and WebP images in your browser. No upload.",
    images: ["/og-image.png"],
  },
};

export default function ImageResizerPage() {
  return <ImageResizerToolView />;
}
