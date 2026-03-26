# Craftkit

누구나 쓸 수 있는 심플한 웹 도구 모음. 가입 없이, 업로드 없이. 브라우저에서 바로.

## 도구

| 도구 | 설명 |
|------|------|
| **Favicon Generator** | 이미지 업로드 → favicon.ico, Apple/Android 아이콘, manifest.json을 ZIP으로 다운로드 |
| **OG Image Generator** | 배경색, 로고, 제목, 부제목 설정 → 1200×630 PNG 다운로드 |

## 특징

- 모든 이미지 처리는 클라이언트 사이드 (Canvas API) — 서버로 전송되지 않음
- 회원가입 불필요

## 시작하기

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` 에서 확인.

## 기술 스택

- **Next.js 15** (App Router)
- **shadcn/ui** + **Tailwind CSS v4**
- **Motion** (애니메이션)
- **fflate** (ZIP 생성)
- **Vitest** + **Testing Library** (테스트)
- **FSD** (Feature-Sliced Design) 폴더 구조

## 테스트

```bash
pnpm test
```

## 폴더 구조

```
src/
├── app/              # Next.js 라우팅
├── views/            # 페이지 뷰
├── widgets/          # 독립적인 UI 블록
├── features/         # 기능 단위 (favicon/og-image export 등)
└── shared/           # 공통 유틸, 설정, UI 컴포넌트
```
