# Craftkit

누구나 쓸 수 있는 심플한 웹 도구 모음. 가입 없이, 업로드 없이. 브라우저에서 바로.

## 도구

| 도구 | 설명 |
|------|------|
| **Favicon Generator** | 이미지 업로드 → favicon.ico, Apple/Android 아이콘, manifest.json을 ZIP으로 다운로드 |
| **OG Image Generator** | 3가지 템플릿(Classic · Gradient · Code Snippet)으로 1200×630 OG 이미지 생성 |
| **Image Resizer** | 이미지 크기 조절 + PNG/JPG/WebP 포맷 변환 |
| **Image Cropper** | 이미지 크롭 + PNG/JPG/WebP 포맷 변환 |
| **Color Format Converter** | HEX · RGB · HSL · OKLCH 색상 포맷 상호 변환 |
| **PDF Converter** | 이미지 → PDF 변환 및 PDF → 이미지 추출 |
| **PDF Password** | PDF 암호 설정 및 해제 — 브라우저에서 처리, 업로드 없음 |

## 특징

- 모든 처리는 클라이언트 사이드 (Canvas API, pdf-lib) — 서버로 전송되지 않음
- 회원가입 불필요

## 시작하기

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` 에서 확인.

## 기술 스택

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Motion** (애니메이션)
- **fflate** (ZIP 생성)
- **pdf-lib** / **@cantoo/pdf-lib** (PDF 생성·암호화)
- **pdfjs-dist** (PDF → 이미지 변환)
- **Jest** + **Testing Library** (테스트)
- **FSD** (Feature-Sliced Design) 폴더 구조

## 테스트

```bash
pnpm test
```

## 폴더 구조

```
app/              # Next.js 라우팅
src/
├── views/        # 페이지 뷰
├── widgets/      # 독립적인 UI 블록
├── features/     # 기능 단위 로직 및 UI
└── shared/       # 공통 유틸, 설정, UI 컴포넌트
```
