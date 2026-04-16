import type { Metadata } from "next";
import { FaviconToolView } from "@/views/favicon-tool/ui/FaviconToolView";

export const metadata: Metadata = {
  title: "Favicon Generator — Craftkit",
  description:
    "Generate favicon.ico, Apple, and Android icons from any image. No upload.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/favicon",
  },
  openGraph: {
    title: "Favicon Generator — Craftkit",
    description:
      "Generate favicon.ico, Apple, and Android icons from any image. No upload.",
    images: ["/og-image.png"],
  },
};

export default function FaviconPage() {
  return <FaviconToolView />;
}
