# Craftkit — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

Craftkit는 개발자와 디자이너를 위한 브라우저 기반 도구 모음 웹앱이다. 메인 페이지에서 도구 목록을 카드 그리드로 보여주고, 클릭하면 해당 도구 페이지로 이동한다. 모든 이미지 처리는 클라이언트 사이드에서 실행되어 서버 업로드 없이 동작한다.

---

## 기술 스택

| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | |
| UI | shadcn/ui | |
| 애니메이션 | Motion | 카드 stagger, 페이지 전환 fade |
| 상태관리 | useState | Zustand는 도구 4-5개 이상 또는 도구 간 상태 공유 시 추가 |
| ZIP 생성 | fflate | 클라이언트 사이드 |
| 패키지 매니저 | pnpm | |
| 폴더 구조 | FSD | `pages` 레이어 대신 `views` 사용 |

---

## 폴더 구조

```
craftkit/
├── app/                          # Next.js App Router (라우팅만 담당)
│   ├── layout.tsx
│   ├── page.tsx                  # → src/views/home 렌더링
│   └── tools/
│       ├── favicon/
│       │   └── page.tsx          # → src/views/favicon-tool 렌더링
│       └── og-image/
│           └── page.tsx          # → src/views/og-image-tool 렌더링
│
└── src/
    ├── views/                    # 페이지 조합 레이어 (FSD pages 대체)
    │   ├── home/
    │   ├── favicon-tool/
    │   └── og-image-tool/
    │
    ├── widgets/                  # 독립적인 UI 블록
    │   ├── tool-card/            # 메인 페이지 도구 카드
    │   ├── favicon-generator/    # Favicon 생성 전체 UI
    │   └── og-image-generator/   # OG Image 생성 전체 UI
    │
    ├── features/                 # 기능 단위
    │   ├── image-upload/         # 드래그앤드롭 파일 업로드
    │   ├── favicon-export/       # Canvas 변환 + fflate ZIP 생성
    │   └── og-image-export/      # Canvas 렌더링 + PNG 저장
    │
    └── shared/
        ├── ui/                   # shadcn 컴포넌트 래퍼
        ├── lib/
        │   ├── canvas.ts         # Canvas 유틸 (리사이징, toBlob)
        │   └── zip.ts            # fflate ZIP 생성 유틸
        └── config/
            └── favicon-sizes.ts  # 생성할 사이즈/파일명 상수
```

---

## 디자인 시스템

- **테마:** 다크 배경 (`#0d0d1a`) + 보라/파랑 컬러 액센트
- **Favicon 도구 컬러:** 보라 (`#7c3aed`)
- **OG Image 도구 컬러:** 파랑 (`#3b82f6`)
- **신규 도구 추가 시:** 도구마다 고유 액센트 컬러 부여

---

## 페이지 구성

### 메인 페이지 (`/`)

- 상단 Nav: 로고(CRAFTKIT 워드마크, 그라디언트)
- 히어로: 한 줄 설명 + "No signup. No upload. Runs in your browser."
- 도구 카드 그리드 (2열): 각 카드에 아이콘, 이름, 설명, 태그(확장자 등)
- Coming soon 카드: 빈 슬롯으로 미래 도구 암시
- 카드 진입 시 Motion stagger 애니메이션

### Favicon Generator (`/tools/favicon`)

**레이아웃:** 2단 (좌: 업로드 + 파일 목록 / 우: 미리보기 + 다운로드)

**좌측:**
- 드래그앤드롭 업로드 영역 (PNG, JPG, SVG, WebP 지원, 512×512 이상 권장)
- 생성될 파일 목록 (파일명 + 사이즈 표시)

**우측:**
- 사이즈별 미리보기 (16, 32, 180, 512px 비율 표시)
- ZIP 다운로드 버튼
- HTML 스니펫 (복사 버튼 포함)

**생성 파일 목록:**
| 파일명 | 사이즈 | 용도 |
|--------|--------|------|
| `favicon.ico` | 16, 32, 48px 멀티 | 브라우저 탭 |
| `favicon-16x16.png` | 16×16 | 브라우저 탭 (소) |
| `favicon-32x32.png` | 32×32 | 브라우저 탭 |
| `apple-touch-icon.png` | 180×180 | iOS 홈화면 아이콘 |
| `android-chrome-192x192.png` | 192×192 | 안드로이드 아이콘 |
| `android-chrome-512x512.png` | 512×512 | 안드로이드 스플래시 |
| `manifest.json` | — | PWA 매니페스트 |

**처리 흐름:**
```
FileReader → ImageBitmap 로드
  → Canvas API로 각 사이즈 리사이징
  → canvas.toBlob() → PNG 변환
  → ICO는 멀티 사이즈 PNG를 ICO 포맷으로 패키징
  → fflate로 ZIP 묶기 → 브라우저 다운로드
```

> `.ico` 변환은 초기에 Canvas 방식으로 구현하고, 품질 이슈 발생 시 `@img/sharp-wasm32` 도입 검토.

### OG Image Generator (`/tools/og-image`)

**레이아웃:** 2단 (좌: 컨트롤 패널 / 우: 실시간 미리보기 + 다운로드)

**좌측 컨트롤:**
- 배경색: 프리셋 팔레트 + 커스텀 컬러 피커
- 로고 업로드 (선택, PNG/SVG 권장)
- 제목 텍스트 입력
- 부제목 텍스트 입력
- 폰트 선택: Inter / Serif / Mono

**우측:**
- 1200×630 비율 실시간 캔버스 미리보기 (입력할 때마다 즉시 반영)
- PNG 다운로드 버튼 (`og-image.png`, 1200×630)

---

## 데이터 흐름

모든 처리는 클라이언트 사이드. 서버 API Route 없음.

```
사용자 입력 (파일 업로드 / 텍스트 입력)
  → useState로 로컬 상태 관리
  → Canvas API로 이미지 렌더링/변환
  → fflate (Favicon) 또는 toBlob (OG Image) → 다운로드
```

---

## 애니메이션

| 위치 | 애니메이션 | 라이브러리 |
|------|-----------|-----------|
| 메인 페이지 카드 진입 | stagger fade-in + translateY | Motion |
| 페이지 전환 | fade | Motion |
| 다운로드 버튼 클릭 | scale 피드백 | Motion |

---

## 향후 확장

도구를 추가할 때는 아래 패턴을 반복한다:
1. `app/tools/<tool-name>/page.tsx` 추가
2. `src/views/<tool-name>/` 추가
3. `src/widgets/<tool-name>/` 추가
4. `src/features/<tool-name>-export/` 추가
5. 메인 페이지 카드 그리드에 카드 추가 (고유 액센트 컬러 부여)

Zustand는 도구가 4-5개 이상 늘거나 도구 간 상태 공유가 필요할 때 도입한다.
