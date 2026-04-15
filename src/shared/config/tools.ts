export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  tags: string[];
  accentColor: string;
  borderColor: string;
  tagBg: string;
  tagText: string;
  icon: string;
  available: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: "favicon",
    name: "Favicon Generator",
    description: "favicon.ico, Apple, Android 아이콘 생성",
    href: "/tools/favicon",
    tags: [".ico", ".png", ".zip"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Globe",
    available: true,
  },
  {
    id: "og-image",
    name: "OG Image Generator",
    description: "소셜 미리보기 이미지 1200×630 생성",
    href: "/tools/og-image",
    tags: ["1200×630", ".png"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Share2",
    available: true,
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    description: "이미지 크기 조절 + 포맷 변환",
    href: "/tools/image-resizer",
    tags: ["px", ".png", ".jpg", ".webp"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Scaling",
    available: true,
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    description: "이미지 크롭 + 포맷 변환",
    href: "/tools/image-cropper",
    tags: ["crop", ".png", ".jpg", ".webp"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Crop",
    available: true,
  },
  {
    id: "color-converter",
    name: "Color Format Converter",
    description: "HEX · RGB · HSL · OKLCH 색상 변환",
    href: "/tools/color-converter",
    tags: ["HEX", "RGB", "HSL", "OKLCH"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Palette",
    available: true,
  },
  {
    id: "pdf-converter",
    name: "PDF Converter",
    description: "이미지 ↔ PDF 변환",
    href: "/tools/pdf-converter",
    tags: [".pdf", ".png", ".jpg", ".webp"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "FileText",
    available: true,
  },
  {
    id: "pdf-password",
    name: "PDF Password",
    description: "PDF 암호 설정 및 해제",
    href: "/tools/pdf-password",
    tags: [".pdf", "암호화", "암호해제"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Lock",
    available: true,
  },
  {
    id: "pdf-watermark",
    name: "PDF Watermark",
    description: "PDF에 텍스트 워터마크 추가",
    href: "/tools/pdf-watermark",
    tags: [".pdf", "워터마크", "텍스트"],
    accentColor: "#a78bfa",
    borderColor: "#a78bfa22",
    tagBg: "#a78bfa0c",
    tagText: "#a78bfa88",
    icon: "Stamp",
    available: true,
  },
];
