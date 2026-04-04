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

### 공유 UI 컴포넌트 사용 시 주의

- `ToolHeader` props: `name`, `description`, `accentColor` — `icon` prop은 존재하지 않음
- `Sidebar`는 뷰포트 너비 768px 미만일 때 접힌 상태(56px)로 시작함

### React Compiler

`next.config.ts`에서 `reactCompiler: true` 활성화되어 있다. `memo`, `useMemo`, `useCallback`을 수동으로 추가하지 말 것.

## Testing

Jest + jsdom 환경. `@/` 경로 별칭 사용 가능. Canvas API는 jsdom에서 미지원이므로 테스트에서 mock 필요 (`HTMLCanvasElement.prototype.toBlob` 등).

기존 테스트 파일(`src/features/image-resize/__tests__/resizeImage.test.ts`)을 Canvas mock 패턴 참고용으로 사용할 것.
