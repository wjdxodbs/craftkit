# PDF Converter — Design Spec

Date: 2026-04-13

## Overview

브라우저에서만 동작하는 PDF 변환 도구. 두 가지 기능을 하나의 도구 안에서 탭으로 제공한다.

- **탭 A: 이미지 → PDF** — 여러 이미지를 순서대로 묶어 PDF 생성
- **탭 B: PDF → 이미지** — PDF 페이지를 선택하여 이미지로 변환

---

## Libraries

| 라이브러리 | 용도 |
|---|---|
| `pdf-lib` | 이미지 → PDF 생성 |
| `pdfjs-dist` | PDF 페이지 → Canvas 렌더링 |
| `fflate` | 여러 이미지 → ZIP 패키징 (기존 의존성) |
| `motion` | 이미지 목록 드래그 재정렬 (기존 의존성) |

---

## Architecture (FSD)

```
src/shared/config/tools.ts          # pdf-converter 항목 추가

src/features/image-to-pdf/
  lib/
    convertImagesToPdf.ts           # File[] → PDF Blob (pdf-lib)
  __tests__/
    convertImagesToPdf.test.ts

src/features/pdf-to-image/
  lib/
    convertPdfToImages.ts           # PDF Blob + page numbers + format → Blob[] (pdfjs-dist)
  __tests__/
    convertPdfToImages.test.ts

src/widgets/pdf-converter/
  ui/
    PdfConverter.tsx                # 탭 상태 관리 + 레이아웃
    ImageToPdfTab.tsx               # 탭 A UI
    PdfToImageTab.tsx               # 탭 B UI
    useImageToPdf.ts                # 탭 A 변환 훅
    usePdfToImage.ts                # 탭 B 렌더링/변환 훅

src/views/pdf-converter-tool/
  ui/
    PdfConverterTool.tsx

app/tools/pdf-converter/
  page.tsx
```

---

## UI Design

### 탭 A — 이미지 → PDF

1. 파일 업로드 영역 (클릭 또는 드래그, 여러 장 동시 가능)
2. 업로드된 이미지 목록
   - 썸네일 + 파일명
   - 삭제 버튼
   - `motion`의 `Reorder` 컴포넌트로 드래그 순서 변경
3. "PDF로 변환" 버튼 → PDF Blob 다운로드

### 탭 B — PDF → 이미지

1. PDF 파일 업로드
2. 페이지 썸네일 그리드
   - 업로드 후 순차적으로 렌더링 (로딩 인디케이터 표시)
   - 각 페이지에 체크박스
   - 전체 선택 / 전체 해제 버튼
3. 포맷 선택: PNG, JPEG, WebP
4. 품질 슬라이더 (JPEG, WebP만)
5. "이미지로 변환" 버튼
   - 1장 선택 → 단일 이미지 파일 다운로드
   - 여러 장 선택 → fflate로 ZIP 다운로드

---

## Data Flow

### 이미지 → PDF

```
File[] (이미지)
  → Canvas에 그려 PNG Blob으로 정규화 (pdf-lib은 PNG·JPEG만 지원; WebP·GIF 등 대응)
  → pdf-lib으로 각 이미지를 페이지에 삽입 (이미지 비율에 맞게 페이지 크기 조정)
  → PDF Blob 생성
  → 다운로드
```

### PDF → 이미지

```
File (PDF)
  → pdfjs-dist로 PDFDocumentProxy 로드
  → 각 페이지를 Canvas에 렌더링 → 썸네일 URL 생성
  → 사용자가 페이지 선택
  → 선택된 페이지를 고해상도로 재렌더링
  → Canvas.toBlob(outputFormat, quality) → Blob[]
  → 1장: 직접 다운로드 / 여러 장: ZIP
```

---

## Error Handling

- 지원하지 않는 파일 형식 업로드 → 에러 메시지 표시
- PDF 로드 실패 (암호화된 PDF 등) → 에러 메시지 표시
- 변환 실패 → 에러 메시지 표시

---

## Testing

- `convertImagesToPdf`: 이미지 Blob 배열 → PDF Blob 반환 검증
- `convertPdfToImages`: Canvas mock 필요 (기존 `resizeImage.test.ts` 패턴 참고)
- 위젯 테스트: 파일 업로드, 탭 전환, 다운로드 트리거
