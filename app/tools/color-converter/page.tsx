import type { Metadata } from "next";
import { ColorConverterToolView } from "@/views/color-converter-tool/ui/ColorConverterToolView";

export const metadata: Metadata = {
  title: "Color Format Converter — Craftkit",
  description:
    "Convert colors between HEX, RGB, HSL, and OKLCH instantly in your browser.",
  alternates: {
    canonical: "https://wjdxodbs-craftkit.vercel.app/tools/color-converter",
  },
  openGraph: {
    title: "Color Format Converter — Craftkit",
    description:
      "Convert colors between HEX, RGB, HSL, and OKLCH instantly in your browser.",
    images: ["/og-image.png"],
  },
};

export default function ColorConverterPage() {
  return <ColorConverterToolView />;
}
