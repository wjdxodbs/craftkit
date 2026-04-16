import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wjdxodbs-craftkit.vercel.app"),
  title: "Craftkit",
  description: "Simple tools for developers & designers. No signup. No upload.",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://wjdxodbs-craftkit.vercel.app",
    title: "Craftkit",
    description:
      "Simple tools for developers & designers. No signup. No upload.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Craftkit",
    description:
      "Simple tools for developers & designers. No signup. No upload.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Craftkit",
              description:
                "Simple tools for developers & designers. No signup. No upload.",
              url: "https://wjdxodbs-craftkit.vercel.app",
            }),
          }}
        />
      </body>
    </html>
  );
}
