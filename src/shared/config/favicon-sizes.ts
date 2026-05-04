export interface FaviconSize {
  filename: string;
  size: number;
  description: string;
}

export const FAVICON_SIZES: FaviconSize[] = [
  { filename: "favicon-16x16.png", size: 16, description: "브라우저 탭 (소)" },
  { filename: "favicon-32x32.png", size: 32, description: "브라우저 탭" },
  { filename: "apple-touch-icon.png", size: 180, description: "iOS 홈화면" },
  {
    filename: "android-chrome-192x192.png",
    size: 192,
    description: "안드로이드 아이콘",
  },
  {
    filename: "android-chrome-512x512.png",
    size: 512,
    description: "안드로이드 스플래시",
  },
];

export const ICO_SIZES = [16, 32, 48] as const;
