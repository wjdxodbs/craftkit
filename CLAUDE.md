# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # 개발 서버 (http://localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm test         # 전체 테스트
pnpm test <path>  # 단일 테스트 파일 실행 (예: pnpm test src/features/color-convert/__tests__/convertColor.test.ts)
pnpm lint         # ESLint
```

## Architecture

**CRAFTKIT** — 서버 없이 브라우저에서만 동작하는 웹 도구 모음. 모든 이미지/데이터 처리는 Canvas API 또는 순수 JS 수식으로 클라이언트에서 처리한다.

### FSD (Feature-Sliced Design) 레이어

```
app/                          # Next.js App Router 라우팅
src/
  views/<tool>-tool/ui/       # 페이지 최상위 레이아웃 래퍼
  widgets/<tool>/ui/          # 독립적인 UI 블록 (상태 포함)
  features/<feature>/
    lib/                      # 순수 함수 비즈니스 로직
    ui/                       # 기능 단위 UI 컴포넌트
    __tests__/                # 로직 단위 테스트
  shared/
    config/tools.ts           # 전체 도구 목록 (홈 화면 카드 생성 기준)
    lib/                      # canvas, ico, zip, utils 공통 유틸
    ui/                       # button, input 기본 컴포넌트
```

### 라우팅 구조

- `/` → 홈 (도구 카드 그리드)
- `/tools/<id>` → 각 도구 페이지, `app/tools/layout.tsx`가 Sidebar를 공통 적용

### 새 도구 추가 패턴

1. `src/shared/config/tools.ts`에 항목 추가
2. `src/features/<name>/lib/` 순수 함수 구현 + `__tests__/` 테스트
3. `src/widgets/<name>/ui/` 위젯 구현
4. `src/views/<name>-tool/ui/` 뷰 래퍼 구현
5. `app/tools/<name>/page.tsx` 페이지 생성

### 핵심 공유 유틸

- `shared/lib/canvas.ts` — `createResizedCanvas`, `canvasToUint8Array` (이미지 처리 기반)
- `shared/lib/zip.ts` — fflate 기반 ZIP 생성
- `shared/lib/ico.ts` — ICO 포맷 생성
- `shared/config/image-formats.ts` — `OutputFormat` 타입, `OUTPUT_FORMATS` 배열, `EXT_MAP` (이미지 포맷 관련 상수 단일 출처)
- `shared/ui/styles.ts` — `labelCls`, `segBtn` (위젯 공통 Tailwind 스타일 유틸)

### 위젯 내부 구조 패턴

복잡한 위젯은 훅과 컴포넌트로 분리한다. `image-cropper`와 `image-resizer`가 이 패턴을 따른다:

```
widgets/<tool>/ui/
  <Tool>.tsx          # 상태 관리 + 레이아웃
  <Tool>ControlBar.tsx # 컨트롤 UI (파일 교체, 포맷 선택 등)
  use<Tool>Preview.ts  # 디바운스 미리보기 훅
  useDragHandling.ts   # (image-cropper 전용) 드래그 인터랙션 훅
```

### 공유 UI 컴포넌트 사용 시 주의

- `ToolHeader` props: `name`, `description`, `accentColor` — `icon` prop은 존재하지 않음
- `Sidebar`는 항상 접힌 상태(56px)로 시작하며, 하단 토글 버튼으로만 열고 닫힘

#### ImageUpload 두 가지 모드

`features/image-upload/ui/ImageUpload.tsx`는 용도에 따라 두 가지 모드로 동작한다:

- `onFileLoad` 콜백: 파일을 읽어 `HTMLImageElement + dataUrl`로 변환 후 전달 (이미지 미리보기가 필요한 도구에서 사용)
- `onFiles` 콜백: 원본 `File[]`을 그대로 전달하고 내부 상태를 유지하지 않음 (PDF 등 이미지가 아닌 파일 처리 시 사용)

두 콜백을 동시에 전달하면 `onFiles`가 우선된다.

주요 props: `accept` (기본값: 이미지 포맷들), `hint` (안내 문구), `multiple`, `variant` (`dashed`|`solid`), `size` (`sm`|`lg`)

#### 파일 교체 패턴

파일을 올린 뒤 상태를 초기화하지 않고 바로 교체할 때는 숨김 input + ref 패턴을 사용한다:

```tsx
const replaceInputRef = useRef<HTMLInputElement>(null)

// JSX
<button onClick={() => replaceInputRef.current?.click()}>파일 교체</button>
<input
  ref={replaceInputRef}
  type="file"
  accept="application/pdf"
  className="sr-only"
  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
/>
```

`pdf-encryptor`의 `PdfEncryptTab`, `PdfDecryptTab`과 `pdf-converter`의 `PdfToImageTab`이 이 패턴을 따른다.

### PDF 암호화 라이브러리

`@cantoo/pdf-lib`을 사용한다. 원본 `pdf-lib`은 암호화를 지원하지 않아서 이 fork를 선택했다. 브라우저에서 기존 PDF에 암호를 거는 대안이 사실상 없다.

### React Compiler

`next.config.ts`에서 `reactCompiler: true` 활성화되어 있다. `memo`, `useMemo`, `useCallback`을 수동으로 추가하지 말 것.

## Testing

Jest + jsdom 환경. `@/` 경로 별칭 사용 가능. Canvas API는 jsdom에서 미지원이므로 테스트에서 mock 필요 (`HTMLCanvasElement.prototype.toBlob` 등).

기존 테스트 파일(`src/features/image-resize/__tests__/resizeImage.test.ts`)을 Canvas mock 패턴 참고용으로 사용할 것.
