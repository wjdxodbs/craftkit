# Visual Contrast Improvement Design

## 문제

전체 페이지가 동일한 `#0d0d1a` 어두운 배경으로 통일되어 있어 사이드바/콘텐츠 영역 구분, 카드 경계, 텍스트 계층이 불분명함.

- `border-white/5` 보더가 거의 안 보임
- `bg-white/5` 카드 배경이 배경과 구분 안 됨
- `text-white/30` 텍스트가 읽기 어려움
- 사이드바와 콘텐츠 영역이 동일한 색상으로 공간 분리감 없음

## 접근 방식: 레이어 강조

어두운 톤은 유지하되, 각 레이어의 밝기 차이를 명확히 해 공간 구분감 확보.

---

## 변경 사항

### 1. 레이어 배경 분리

| 레이어 | 기존 | 변경 |
|--------|------|------|
| 사이드바 | `#0d0d1a` | `#0d0d1a` (유지 — 가장 어두운 레이어) |
| 콘텐츠 영역 (`<main>`) | `#0d0d1a` | `bg-[#111127]` (살짝 밝게) |
| 홈 페이지 배경 | `bg-[#0d0d1a]` | 유지 |

파일: `app/tools/layout.tsx`

### 2. 보더 밝기 상향

| 위치 | 기존 | 변경 |
|------|------|------|
| 사이드바 전체 보더 | `border-white/5` | `border-white/10` |
| 툴 레이아웃 구분선 | `border-white/5` | `border-white/10` |
| FaviconGenerator 카드/행 | `border-white/5` | `border-white/10` |
| OgImageGenerator 카드/행 | `border-white/5` | `border-white/10` |
| HomeView 네비/카드 | `border-white/5` | `border-white/10` |

### 3. 카드 배경 상향

| 위치 | 기존 | 변경 |
|------|------|------|
| FaviconGenerator 파일 행 | `bg-white/5` | `bg-white/[0.08]` |
| FaviconGenerator 프리뷰 박스 | `bg-white/5` | `bg-white/[0.08]` |
| FaviconGenerator 코드 스니펫 박스 | `bg-[#0a0a14]` | `bg-white/[0.06]` |
| OgImageGenerator 섹션 카드들 | `bg-white/5` | `bg-white/[0.08]` |

### 4. 텍스트 가독성

| 위치 | 기존 | 변경 |
|------|------|------|
| 홈 서브텍스트 | `text-white/30` | `text-white/50` |
| FaviconGenerator 크기 텍스트 등 | `text-white/30` | `text-white/50` |
| OgImageGenerator 레이블 등 | `text-white/30` | `text-white/50` |
| 사이드바 비활성 링크 | `text-white/40` | `text-white/50` |
| 사이드바 토글 버튼 | `text-white/30` | `text-white/40` |

---

## 변경 파일 목록

- `app/tools/layout.tsx` — main 배경색 변경
- `src/widgets/sidebar/ui/Sidebar.tsx` — 보더, 텍스트 색상
- `src/widgets/favicon-generator/ui/FaviconGenerator.tsx` — 보더, 카드 배경, 텍스트
- `src/widgets/og-image-generator/ui/OgImageGenerator.tsx` — 보더, 카드 배경, 텍스트
- `src/views/home/ui/HomeView.tsx` — 보더, 서브텍스트

## 범위 제외

- 브랜드 컬러(보라/파랑 그라디언트) 변경 없음
- 레이아웃 구조 변경 없음
- 애니메이션 변경 없음
- globals.css CSS 변수 변경 없음 (컴포넌트 인라인 Tailwind만 수정)

## 검증

```bash
pnpm build  # TypeScript 오류 없음
pnpm dev    # 브라우저에서 시각적으로 확인
            # 사이드바와 콘텐츠 영역 구분 확인
            # 카드 경계선 보임 확인
            # 텍스트 가독성 향상 확인
```
