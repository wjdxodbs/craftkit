import type { Metadata } from "next";
import { OgImageToolView } from "@/views/og-image-tool/ui/OgImageToolView";

export const metadata: Metadata = {
  title: "OG Image Generator — Craftkit",
  description:
    "Create 1200×630 social preview images instantly in your browser. No upload.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/og-image",
  },
  openGraph: {
    title: "OG Image Generator — Craftkit",
    description:
      "Create 1200×630 social preview images instantly in your browser. No upload.",
    images: ["/og-image.png"],
  },
};

export default function OgImagePage() {
  return <OgImageToolView />;
}
