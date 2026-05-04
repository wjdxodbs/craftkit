# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev                 # 개발 서버 (http://localhost:3000)
pnpm build               # 프로덕션 빌드
pnpm test                # 전체 테스트
pnpm test <path>         # 단일 테스트 파일 실행
pnpm lint                # ESLint
pnpm exec tsc --noEmit   # 타입체크
```

## Architecture

**CRAFTKIT** — 서버 없이 브라우저에서만 동작하는 웹 도구 모음. 모든 이미지/PDF 처리는 Canvas API, `pdf-lib`, `pdfjs-dist`로 클라이언트에서 수행한다.

### FSD (Feature-Sliced Design) 레이어

```
app/                          # Next.js App Router 라우팅
src/
  views/<tool>-tool/ui/       # 페이지 최상위 래퍼 (ToolPageLayout + 위젯)
  widgets/<tool>/ui/          # 독립적인 UI 블록 (상태 포함)
  features/<feature>/
    lib/                      # 순수 함수 비즈니스 로직
    ui/                       # 기능 단위 UI 컴포넌트
    __tests__/                # 로직 단위 테스트
  shared/
    config/                   # tools 메타·이미지 포맷·favicon 사이즈
    lib/                      # canvas·color·format·zip 등 공용 유틸
    ui/                       # shadcn 컴포넌트 + 도메인 공용 컴포넌트
```

### 라우팅

- `/` → 홈 (도구 카드 그리드, `HomeView`)
- `/tools/<id>` → 각 도구 페이지. `app/tools/layout.tsx`가 Sidebar 공통 적용

### 새 도구 추가 패턴

1. `src/shared/config/tools.ts`에 항목 추가 — `icon`은 lucide-react 컴포넌트를 직접 import해 참조 (문자열 아님)
2. `src/features/<name>/lib/` 순수 함수 + `__tests__/` 테스트
3. `src/widgets/<name>/ui/<Name>.tsx` 위젯 구현
4. `src/views/<name>-tool/ui/<Name>ToolView.tsx` — `<ToolPageLayout toolId="<id>"><Widget /></ToolPageLayout>` 패턴
5. `app/tools/<name>/page.tsx` 페이지

### 공용 UI 컴포넌트 (shared/ui)

shadcn 기반 (`components.json` style: **`base-nova`** = `@base-ui/react` 기반). 컴포넌트 파일의 기본 스타일은 **프로젝트 다크 톤 + 보라 포인트(`#a78bfa`)로 이미 고정**되어 있어 대부분 사용처에서 추가 className 없이 바로 쓰면 된다.

기본 컴포넌트: `Button`, `Input`, `Label`, `Slider`, `Alert`, `Tabs`, `ToggleGroup`/`Toggle`

프로젝트 확장 variant:

- `Button` — `variant="primary-outline"` + `size="full"` (풀폭 보라 outline, DownloadButton 내부용); `variant="segment"` + `size="seg"` (기존 segBtn 대체)
- `Toggle` / `ToggleGroupItem` — `variant="segment"` + `size="seg"`
- 모든 `ToggleGroup`은 `spacing={4}`로 통일

도메인 공용 컴포넌트:

- `ToolPageLayout` — `toolId` 기준 TOOLS 조회 후 `ToolHeader` + children 래핑. `fullHeight` prop으로 mobile dvh 레이아웃(Signature Maker)
- `ToolHeader` — 제목/설명/accent 언더라인 (`name`, `description`, `accentColor`)
- `DownloadButton` — 풀폭 primary-outline 버튼 + motion tap 애니메이션 + `isProcessing` / `processingText`
- `FileReplaceHeader` — 파일명 h3 + 오른쪽 "파일 교체" 링크 + 숨김 input (PDF 위젯들)
- `FileReplaceDropzone` — 드래그/드롭 가능한 dashed 파일 교체 버튼 (이미지 위젯들)
- `PageThumbnailButton` — PDF 페이지 썸네일 토글. lazy 로딩 연결용 `buttonRef` prop
- `ColorSwatchPicker` — 프리셋 스와치 + 커스텀 color picker (`colors`, `value`, `onChange`, `fallbackCustom`)
- `Sidebar` — 초기 접힘(56px), 하단 토글로 확장(220px)

### 핵심 공용 유틸 (shared/lib)

- `canvas.ts` — `createResizedCanvas`, `canvasToBlob` (Promise 래퍼, quality 옵션), `canvasToUint8Array`
- `color.ts` — `hexToRgb`, `rgbToHex`, `isLightColor`
- `format.ts` — `formatByteSize` (바이트 → "xx KB" / "x.x MB")
- `loadImageFromFile.ts` — File → `{ img, dataUrl }` 로드
- `useDebouncedBlobUrl.ts` — 디바운스된 Blob URL + size (미리보기용, 자동 revoke)
- `usePageSelection.ts` — PDF 페이지 선택 Set. `pages` 인자 전달 시 `selectAll`이 최신 pages를 자동 참조
- `downloadBlob.ts`, `fileName.ts` (sanitize/buildOutputName), `zip.ts` (fflate), `ico.ts`

### 핵심 공용 설정 (shared/config)

- `tools.ts` — `TOOLS` 배열. `icon`은 `ComponentType`(lucide) 직접 저장
- `image-formats.ts` — `OutputFormat` 타입, `OUTPUT_FORMATS` 배열, `EXT_MAP` (이미지 포맷 상수 단일 출처)
- `favicon-sizes.ts` — `FAVICON_SIZES`, `ICO_SIZES`

### 위젯 내부 구조 패턴

복잡한 위젯은 훅 + 서브 컴포넌트로 분리:

```
widgets/<tool>/ui/
  <Tool>.tsx           # 상태 + 레이아웃 (훅 합성)
  <Tool>ControlBar.tsx # 컨트롤 UI (optional)
  use<Tool>*.ts        # 도메인 훅 (preview debounce, PDF 처리 상태 등)
```

PDF 위젯(pdf-converter, pdf-encryptor)은 위젯 루트에서 shadcn `Tabs`로 서브탭 구성.

### ImageUpload 두 가지 모드

`features/image-upload/ui/ImageUpload.tsx`:

- `onFileLoad`: 파일을 `HTMLImageElement + dataUrl`로 변환해 전달 (이미지 도구)
- `onFiles`: 원본 `File[]`을 그대로 전달 (PDF 등 비이미지)

둘 다 전달 시 `onFiles` 우선. props: `accept`, `hint`, `multiple`, `variant` (`dashed`|`solid`), `size` (`sm`|`lg`|`xl`)

### PDF 라이브러리 현황

- `@cantoo/pdf-lib` — 암호 설정/해제 전용 (`features/pdf-encrypt`). 원본 `pdf-lib`은 암호화 미지원이라 이 fork를 선택
- `pdf-lib` — 워터마크, 이미지→PDF, 페이지 분할 (`pdf-watermark`, `pdf-split`, `image-to-pdf`)
- `pdfjs-dist` — PDF→이미지 렌더링 (`pdf-to-image`). 워커 경로는 `convertPdfToImages.getPdfjsLib()`에서 동적 할당

두 pdf-lib fork가 공존하는 상태. 필요 시 `@cantoo/pdf-lib`로 통일 검토 가능.

### React Compiler

`next.config.ts`의 `reactCompiler: true` 활성. **`memo`, `useMemo`, `useCallback`을 수동 추가하지 말 것.**

## Testing

Jest + jsdom. `@/` 경로 별칭 지원. jsdom은 Canvas 2D API를 제공하지 않아 `src/test-setup.ts`에서 `HTMLCanvasElement.prototype.getContext`와 `toBlob`을 전역 mock한다. 새 canvas 메서드(`roundRect`, `moveTo` 등)를 쓰면 setup mock에도 추가 필요.

로컬 mock 추가 시 실제 shared 유틸을 재사용하려면:

```ts
jest.mock('@/shared/lib/canvas', () => ({
  ...jest.requireActual('@/shared/lib/canvas'),
  createResizedCanvas: jest.fn(...),
}))
```
