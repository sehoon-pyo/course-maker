# 구현 계획: 슬라이드 마스터

이 문서는 [`docs/adr/[261007_004]_adr.md`](./adr/[261007_004]_adr.md)에서 확정한 결정을 어떻게 구현할지와 언제 끝난 것으로 볼지를 정한다. 결정의 이유는 ADR과 [노트 004](./notes/[261007_004]_note.md)를 본다. 구현하면서 계획이 바뀌면 이 문서를 먼저 고친다.

- 작업 브랜치: `feature/slide-master`
- 상태: 단계 1, 2 구현 완료, 단계 3부터 남음

## 1. 목표와 범위

**목표**: 강의마다 슬라이드 마스터(배경, layout, 디자인)를 골라 슬라이드를 그릴 수 있게 한다. 슬라이드 파일은 `layout`과 요소만 고르고, 디자인은 마스터가 정한다.

**포함**
- `CourseMeta`에 `master`, `sectionLabel` 추가
- 마스터 정의(`defineMaster`), 등록, 조회, 검증
- `MasterFrame`과 `Slide`의 layout 렌더링(background, layout, element 세 단계)
- `default` 마스터(layout 4개: 대제목, 목차, 컨텐츠, 제목만 있는 컨텐츠)
- 요소: `Text`, `Shape`, `Image`, `Chip`, `PromptBox`, `Toc`와 기존 요소의 슬롯 배치
- `sectionLabel`을 목차, 사이드바, 상단 바에 적용
- 강의 전용 마스터와 강의 전용 요소의 동작 확인(샘플로)
- 문서 갱신(README, 용어사전, CLAUDE.md, ADR 상태)

**제외** (ADR-12와 미결)
- PPTX, PDF, 단일 HTML export 자체(마스터는 export가 읽을 수 있는 데이터로 만들어 둘 뿐이다)
- 화면 편집과 임시 JSON, `Group`, `Row`/`Column`, 표, 앵커, 날짜/바닥글/슬라이드 번호 슬롯
- 미리보기의 마스터 선택 드롭다운
- `extendMaster`(ADR-003 ADR-3에서 지원하기로 했지만 CSS 합치기가 미결이라 이번 범위에서 뺀다. `defineMaster`의 구조는 나중에 추가할 수 있게 둔다)

## 2. 현재 상태 (확인한 것)

- `CourseMeta`는 `title`만 있다(`src/types.ts`).
- `Slide`는 `<div className="slide">`뿐이다(`src/elements/index.tsx`).
- `App.tsx`는 `Component`를 `SlidePreviewArea` 안에서 바로 그린다.
- 슬라이드 배경은 `.slide-preview-area-slide`가 `--color-slide-bg`로 칠한다(미리보기 영역 쪽 CSS).
- 테마 토큰(`--color-*`, `--size-*`, `--badge-*`)과 요소 스타일이 모두 `src/styles.css`에 있다.
- 사이드바는 section의 `title`을 그대로 보여 주고, 상단 바 breadcrumb은 `chapter / section / slide` 이름이다.
- 샘플 슬라이드는 17장이고 모두 `<Slide>`에 `Title`, `Paragraph`, `Bullets`만 쓴다. 각 section의 `sl.1_title`은 `Title` + `Paragraph`(부제)이다.
- 테스트와 린트는 없다. 확인 수단은 `npm run typecheck`, `npm run build`, 화면 확인이다.

## 3. 구조

```
src/masters/
  types.ts            Master, Layout, Slot, Layer 타입
  define.ts           defineMaster, 검증(id 중복, 층 대체와 제거, layout/슬롯 구조), 배경 해석
  registry.ts         import.meta.glob으로 마스터 등록, resolveMaster(강의, id)
  context.ts          MasterContext, useMaster, useChapterInfo
  MasterFrame.tsx     마스터와 chapter 정보를 context로 내리고 .slide 컨테이너를 그림
  Layers.tsx          background/layout 층을 그림 (color, image, shape, text)
  default/
    index.tsx         default 마스터 (defineMaster)
    assets/           logo.svg, logo.png (이미 있음)
src/elements/
  index.tsx           Slide(layout), Title, Paragraph, Bullets (슬롯 배치로 변경)
  free.tsx            Text, Shape, Image (at)
  widgets.tsx         Chip, PromptBox, Toc
  inline.ts           (변경 없음)
```

**마스터가 담는 것**: `id`, `tokens`(CSS 변수 값), `background`(층 배열), `layouts`(layout id → `{ background?, decorations, slots }`).

**렌더링 흐름**
1. `App`이 `resolveMaster(course.master ?? "default")`로 마스터를 찾고, 현재 chapter 정보와 함께 `<MasterFrame>`에 넘긴다.
2. `MasterFrame`이 `.slide[data-master]` 컨테이너를 그리고 `tokens`를 인라인 CSS 변수로 준다.
3. `Slide`가 `layout`(기본 `content`)을 골라 세 단계(`background`, `layout`, `element`)를 각각 `position: absolute; inset: 0; isolation: isolate` 컨테이너로 그린다. layout에 `background`가 있으면 master의 층 배열에 `id`로 대체, 추가, 제거를 적용한 결과를 쓴다.
4. element 단계에서 `Slide`가 자식을 훑어, `at`이 있는 자식은 절대 위치로, 없는 자식은 요소 종류에 맞는 슬롯의 컨테이너(`position: absolute`, 슬롯 `x, y, w, h`, 세로 쌓기, 간격은 토큰)에 넣는다. 요소는 `slotKinds`라는 정적 속성(예: `Title.slotKinds = ["title"]`)으로 자기가 들어갈 슬롯 종류를 알린다.

**구현에서 정하는 것 (ADR에 없음, 이 계획에서 제안)**

| 항목 | 제안 |
|---|---|
| layout id | `title`, `toc`, `content`, `title-only` |
| 요소 → 슬롯 | `Title` → `title`. `Paragraph` → `body`, 없으면 `subtitle`, 없으면 `free`. `Bullets` → `body`, 없으면 `free`. `Toc` → `list` |
| 슬롯이 없을 때 | 해당 layout에 맞는 슬롯이 없는 요소는 오류가 아니라 경고하고 그리지 않는다 |
| 요소 디자인 값 | `Chip`, `PromptBox`는 `--chip-*`, `--promptbox-*` CSS 변수를 읽고, 값은 마스터의 `tokens`에서 온다 |
| `Chip`의 `at` | `x, y`만 받고 `w, h`는 글자에 맞춰 자동. 높이는 토큰 |
| `Image`의 `src` | Vite가 가져온 이미지 주소(강의 폴더의 상대 경로 import). `alt`, 맞춤(`fit`)은 필요할 때 추가 |
| `sectionLabel` 표시 | `{라벨} {번호}` 뒤에 제목(예: `SECTION 1 변수`). 사이드바, 상단 바, 목차에서 같은 형식 |
| 슬라이드 `layout` 오류 | 없는 layout 이름이면 사용 가능한 목록과 함께 오류 |

## 4. 단계별 작업과 완료 기준

각 단계는 앞 단계가 끝난 뒤 시작한다. 단계가 끝나면 `npm run typecheck`가 통과해야 한다.

### 단계 1. 메타와 마스터 기반 (완료)

**작업**
- `CourseMeta`에 `master?: string`, `sectionLabel?: string` 추가(`src/types.ts`).
- `src/masters/types.ts`, `define.ts`, `registry.ts` 작성.
  - `registry.ts`: `import.meta.glob("/src/masters/*/index.tsx")`와 `import.meta.glob("/courses/*/masters/*/index.tsx")`. `_` 시작 폴더 제외. 조회 순서 ① 강의 전용 → ② 도구 제공. 둘 다 없으면 사용 가능한 마스터 목록과 함께 오류.
  - `define.ts`: `defineMaster`는 타입 검사를 위한 항등 함수이고, 검증과 상속 풀기는 `buildMaster(id, source, def)`가 한다(마스터 id를 알아야 오류 메시지에 쓸 수 있기 때문). 검증은 층, 슬롯, layout의 `id` 중복, 존재하지 않는 `id`의 `remove`, layout `background`의 대체와 추가 규칙, 토큰 키, 슬롯 값이다. 문제는 한꺼번에 모아 `MasterError`로 던진다.
- `courses.ts`가 강의의 `sectionLabel`(기본 `SECTION`)과 `master`를 `CourseNode`에 싣는다.

**완료 기준** (모두 Playwright MCP로 개발 서버의 브라우저에서 모듈을 불러와 확인함)
- [x] 같은 `id`가 층 배열에 둘이면 검증이 오류를 낸다(층의 이름이 메시지에 있음).
- [x] layout의 `background`가 master의 층을 `id`로 대체하고(제자리), 새 `id`는 위에 쌓고, `remove`가 층을 뺀다. master 자체는 바뀌지 않는다. 없는 `id`의 `remove`는 오류.
- [x] `resolveMaster("없는id")`가 사용 가능한 목록과 함께 오류를 낸다. `_`로 시작하는 폴더는 등록되지 않고, `default` export가 없는 마스터는 안내 오류를 낸다.
- [x] 같은 id의 마스터가 강의 전용과 도구 제공 양쪽에 있으면 강의 전용이 선택된다. 임시 마스터 파일로 확인하고 지웠다. 실제 샘플 마스터로 다시 확인하는 것은 단계 6에서 한다.
- [x] `master`와 `sectionLabel`이 없는 `sample`, `sample2`가 아무 변화 없이 읽힌다(`default`, `SECTION`, 슬라이드 11장과 6장, 경고 없음). 메타에 값을 지정하면 그대로 읽힌다(임시로 시험하고 되돌림).
- [x] `npm run typecheck`, `npm run build` 통과.

**구현하며 알게 된 것**
- `import.meta.glob`에 `import: "default"`를 쓰면 `default` export가 없는 마스터 파일 하나 때문에 레지스트리 전체가 읽히지 않고 `SyntaxError`가 난다. 모듈 전체를 받아 `.default`를 직접 읽도록 했다.
- 아직 `default` 마스터가 없어서(단계 3) 지금은 `resolveMaster("sample")`가 "사용 가능한 마스터: 없음" 오류를 낸다. `App`이 마스터를 부르는 것은 단계 2이다.

### 단계 2. 렌더링 경로 (완료)

**작업**
- `MasterFrame`, `context.ts`, `Layers.tsx`(color, image, shape, text) 작성.
- `Slide`를 `layout` prop을 받는 세 단계 렌더러로 바꾼다. 마스터 밖에서 `Slide`를 그리면 오류.
- 요소(`Title`, `Paragraph`, `Bullets`)를 슬롯 배치로 바꾼다(`slotKinds`). 한 슬롯에 여러 요소는 세로로 쌓는다.
- `App.tsx`가 `MasterFrame`으로 감싼다. `SlidePreviewArea`의 `.slide-preview-area-slide` 배경은 제거하고(마스터의 `background` 층이 칠함) 크기와 `transform: scale`만 남긴다.
- `styles.css`의 슬라이드 디자인 값은 CSS 변수 참조로만 남긴다. 값 정의는 마스터의 `tokens`로 옮기고, `@font-face`와 미리보기 UI 스타일은 그대로 둔다.
- 세 단계 컨테이너의 쌓임 맥락과 `z-index`(단계 고정, 단계 안은 배열 순서 × 100)를 적용한다.

**완료 기준** (Playwright MCP로 개발 서버의 브라우저에서 확인함)
- [x] `.slide` 안에 `background`, `layout`, `element` 단계 컨테이너가 이 순서로 있고, 각각 `isolation: isolate`이다(`z-index` 1, 2, 3).
- [x] 단계를 넘지 못한다. 배경 단계 안에 `z-index: 2147483647`인 요소를 제목 위치에 넣어도 `element` 단계의 제목이 위에 있다(`elementFromPoint`).
- [x] 슬롯에 들어간 요소는 슬롯의 `x, y, w, h`에 놓인다(슬롯 컨테이너의 위치와 크기가 선언한 값과 같음).
- [x] 없는 layout 이름, 없는 슬롯 id, 마스터 밖의 `Slide`, 없는 마스터를 지정한 강의가 각각 명확한 오류를 슬라이드 자리에 보여 주고, 사이드바와 이동은 계속 동작한다.
- [x] 미리보기의 확대 축소(배율 0.691 → 0.298)에서 세 단계와 슬롯이 슬라이드 좌표로는 같은 위치이다.
- [x] 회귀 없음: 코드를 고치기 전과 후에 17장 모두 `.el-title`, `.el-paragraph`, `.el-bullets`, `li`의 위치, 크기, 글자 크기, 굵기, 색, 줄 높이를 측정해 비교했고 67개 항목이 모두 같다. 화면도 눈으로 확인했다.
- [x] 17장을 모두 훑는 동안 콘솔 오류와 경고가 없다. `npm run typecheck`, `npm run build` 통과.

**구현하며 정한 것과 알게 된 것**
- **임시 `default` 마스터**: `App`이 마스터를 부르려면 `default`가 있어야 해서, 지금의 슬라이드 모양(흰 배경, 제목 위치 x96 y96, 본문 y239)을 그대로 옮긴 `content` layout 하나짜리 `src/masters/default/index.tsx`를 만들었다. 단계 3에서 PPTX의 값으로 바꾼다.
- **자동 매핑**: 요소는 정적 속성 `slotKinds`로 들어갈 슬롯 종류를 알린다(`Title`: title / `Paragraph`: body, subtitle, free / `Bullets`: body, free). `slot` 속성으로 슬롯 id를 직접 지정할 수 있다. 맞는 슬롯이 없으면 경고하고 그리지 않는다.
- **색 토큰 규칙**: 색 값이 `primary`처럼 토큰 이름이면 `--color-primary`로 해석한다(`src/masters/color.ts`). 마스터가 `tokens`에 `--color-primary`를 가졌을 때만 토큰으로 본다.
- **글자 속성에 `anchor`(세로 정렬) 추가**: PPTX의 제목 슬롯이 세로 가운데 정렬이라 `TextStyle`에 넣었다.
- **오류 경계**: `SlideErrorBoundary`를 추가해 슬라이드를 그리다 난 오류가 화면 전체를 멈추지 않게 했다.
- **넘침 경고는 `scrollHeight`로 재면 오탐이 난다**. 글꼴의 글자 영역(76px 제목에서 102px)이 줄 높이(95px)보다 커서, 맞는 제목도 넘친다고 나왔다. 자식 요소의 박스로 재도록 바꿨고, 일부러 넘치게 한 본문만 경고하는 것을 확인했다.
- **flex 슬롯에서 불릿 마지막 항목의 아래 여백이 목록 높이에 포함되어** 20px 달라져서, 마지막 항목의 여백을 0으로 했다.
- **슬라이드 디자인 값 이동**: `styles.css`의 `:root` 슬라이드 토큰(색, 크기, 뱃지 색, 슬라이드 배경, 패딩)을 지우고 마스터의 `tokens`로 옮겼다. 요소는 변수만 읽는다. 마스터가 필요한 토큰(`--color-text`, `--color-primary`, `--color-code-bg`, `--badge-*`, `--size-title`, `--size-body`, `--slot-gap`)을 빠뜨리면 CSS 변수가 비어 값이 적용되지 않는다. 필요한 토큰을 검증할지는 단계 6의 강의 전용 마스터를 만들 때 정한다.
- 핫 리로드 중에 일부 모듈만 갱신되면 옛 `App`이 새 `Slide`를 그려 "마스터 밖" 오류가 한 번 났다. 페이지를 새로 불러오면 사라지는 개발 중 현상이다.

### 단계 3. `default` 마스터

**작업**
- `src/masters/default/index.tsx`에 `defineMaster`로 PPTX의 값을 옮긴다(아래 표). 로고는 `assets/logo.svg`.
- `tokens`: 주색 `#164194`, 진한 주색 `#204273`, 연한 회색 `#E7E6E6`, 글자 크기, 여백, `--chip-*`, `--promptbox-*`(기본값은 PPTX의 현재 값).
- `Slide`의 기본 layout은 `content`. 각 section의 `sl.1_title`은 `layout="title"`로 바꾼다.

| layout | 슬롯 | 장식 (layout 단계) |
|---|---|---|
| `title` | `title` x0 y385 w1920 h209(가운데, 132px, `#164194`), `subtitle` x0 y610 w1920 h80(새로 정한 값, PPTX에 없음) | 왼쪽 위 도형(x-44 y-50 w666 h236, `#F2F2F2`, 그림자), 오른쪽 아래 도형(x1278 y884 w746 h196, `#204273`, 그림자), 로고(x1587 y52 w254 h58) |
| `content` | `title` x58 y28 w1656 h73(흰 글씨 48px), `body` x53 y206 w1815 h770(48px) | 위쪽 띠(x0 y0 w1920 h116, `#164194`), 삼각형 탭(x-24 y88 w106 h58) |
| `title-only` | `title`(위와 같음), `free` x53 y206 w1815 h770 | `content`와 같음 |
| `toc` | `list` 10줄(y173에서 시작, `pitch` 76, 번호 열 x364 w228 28px `#164194`, 이름 열 x614 w1128 36px) | 왼쪽 패널(x0 y0 w364 h1080, `#E7E6E6` 투명도 29%), 위쪽 띠(x0 y0 w1071 h50, 투명도 5%), 라벨 `text` 층("CONTENTS" 32px, "목차" 80px) |

**완료 기준**
- [ ] 위 표의 슬롯 좌표와 장식 좌표가 코드의 값과 일치한다(좌표를 한 번 훑어 대조).
- [ ] 샘플 17장이 모두 오류, 경고 없이 그려지고, 슬라이드 파일은 `sl.1_title`의 `layout="title"` 외에는 바뀌지 않는다.
- [ ] 샘플 17장의 화면을 직접 보고 확인한다(색, 띠, 부제 위치가 PPTX의 값과 비슷한지). 주색이 바뀌므로 이전 모습과 다른 것은 예상된 변화다.
- [ ] `title`, `content`, `title-only`, `toc` 네 layout을 각각 화면에서 확인한다.

### 단계 4. 자유 배치 요소와 위젯

**작업**
- `Text`, `Shape`, `Image`(`at`, ADR-7의 속성). 색은 직접 값과 토큰 이름을 모두 받는다.
- `Chip`(아이콘 경로, 글자 폭 자동, 높이와 모양은 토큰), `PromptBox`(박스 크기 기준 안쪽 배치, 기본값 PPTX 값, 아이콘 선택).
- `Toc`: 현재 chapter의 section 목록으로 자동 채움. section이 슬롯의 줄 수보다 많으면 넘치는 항목은 표시하지 않고 콘솔 경고.
- 샘플 `courses/sample/ch.3_master`를 추가해 네 layout과 위 요소를 모두 쓰는 슬라이드를 만든다.

**완료 기준**
- [ ] `Text`/`Shape`/`Image`가 `at`의 좌표에 놓이고, `at`이 없으면 슬롯으로 간다.
- [ ] `Shape`의 `rect`, `roundRect`, `ellipse`, `rightArrow`, `triangle`, `line`, 자유형 `path`가 모두 그려지고, 채움, 선, 점선, 회전, 그림자, 안의 글자가 동작한다.
- [ ] `Chip`의 폭이 글자 길이에 따라 달라지고(짧은 글자와 긴 글자 비교), 아이콘이 없어도 그려진다.
- [ ] `PromptBox`를 두 가지 크기(399×171, 559×388)로 그리면 안쪽 배치가 박스 크기에 맞게 계산된다.
- [ ] `Toc`가 section 목록과 같은 순서, 같은 제목으로 채워지고, 11개 section 이상일 때 11번째부터 표시하지 않고 경고한다.
- [ ] `Toc`에 `items` 같은 직접 지정 속성이 없다(타입에서 막힘).

### 단계 5. `sectionLabel` 적용

**작업**
- 사이드바의 section 제목, 상단 바 breadcrumb의 section, `Toc`의 항목에 `{sectionLabel} {번호}` 형식을 적용한다.
- 샘플 하나(`sample2`)에 `sectionLabel: "UNIT"`을 지정해 확인한다.

**완료 기준**
- [ ] 지정하지 않은 강의(`sample`)는 `SECTION 1 …`, 지정한 강의(`sample2`)는 `UNIT 1 …`로 사이드바, breadcrumb, 목차에서 같게 보인다.

### 단계 6. 강의 전용 마스터와 요소

**작업**
- `courses/sample2/masters/plain/index.tsx`: layout `title`, `content`만 가진 작은 마스터(색과 장식이 `default`와 달라야 함). `sample2`의 `meta.ts`에 `master: "plain"`.
- `courses/sample2/elements/index.ts`: `export * from "@/elements"`에 더해 강의 전용 요소 하나(예: 색과 아이콘을 바꾼 `Chip` 변형)와 같은 이름 하나(도구 요소를 덮어쓰는 것)를 내보낸다. `sample2`의 슬라이드 하나가 `../../../elements`에서 가져온다.
- (선택) 같은 id `default`를 `courses/sample2/masters/default/`에 임시로 두고 강의 전용이 우선하는지 확인한 뒤 지운다.

**완료 기준**
- [ ] `sample2`가 `plain` 마스터로 그려지고, `sample`은 `default`로 그려진다(강의 전환 시 디자인이 바뀜).
- [ ] 슬라이드가 `../../../elements`에서 도구 요소와 강의 전용 요소를 한 번에 가져오고 타입 검사를 통과한다.
- [ ] 같은 이름이면 강의의 것이 쓰인다(ES 모듈의 `export *` 우선순위 동작을 이 프로젝트에서 확인).
- [ ] 임시로 둔 `default` 중복 마스터에서 강의 전용이 선택됨을 확인하고 임시 파일을 지운다.

### 단계 7. 문서 갱신과 마무리

**작업**
- README: 현재 상태 표("슬라이드 마스터, 레이아웃" 사용 가능으로), 구조도의 "아직 구현되지 않음" 표시 제거, `courses/{강의}/elements/`, `sectionLabel`, 샘플 슬라이드 수 갱신, 슬라이드 작성 가이드에 `layout`과 새 요소 추가.
- `docs/glossary.md`: "아직 구현되지 않음" 문구 제거, `list` 슬롯, `text` 층, 강의 전용 요소, `sectionLabel` 추가.
- `CLAUDE.md`: 구조도와 마스터 서술, 강의 전용 요소의 가져오는 경로.
- ADR [261007_004] 상태를 "구현됨"으로 바꾸고, 구현 중에 정한 것(위 "구현에서 정하는 것")을 반영한다. 계획 대비 달라진 점은 노트 004 또는 새 노트에 적는다.

**완료 기준**
- [ ] 문서의 "아직 구현되지 않음" 문구가 실제 상태와 일치한다.
- [ ] README의 "5분 시작하기"를 따라 `npm install`, `npm run dev`를 하면 샘플이 보인다.

## 5. 최종 완성 기준

아래를 모두 만족하면 이번 작업이 끝난 것으로 본다.

**자동으로 확인**
1. `npm run typecheck`와 `npm run build`가 오류 없이 통과한다.
2. 브라우저 콘솔에 샘플 두 강의를 모두 훑는 동안 오류와 경고가 없다(`Toc` 초과 경고는 의도한 시험 슬라이드에서만).

**기능**
3. 강의 `meta.ts`의 `master`로 마스터를 고를 수 있고, 지정하지 않으면 `default`이다. 없는 id는 목록과 함께 오류가 난다.
4. 강의 전용 마스터가 도구 제공 마스터보다 우선한다.
5. 슬라이드가 `layout`을 고르고(생략 시 `content`), 네 layout이 PPTX 값으로 그려진다.
6. 배경은 층의 구성이고, layout이 `id`로 일부만 대체하거나 제거할 수 있다.
7. 세 단계(background < layout < element)가 서로를 넘지 못하고, 단계 안은 배열(작성) 순서로 쌓인다.
8. `Text`, `Shape`, `Image`, `Chip`, `PromptBox`, `Toc`가 동작하고, 슬롯의 요소는 슬롯 위치에, `at`이 있는 요소는 `at` 위치에 놓인다.
9. `Toc`는 chapter의 section으로 자동 채워진다.
10. `sectionLabel`이 목차, 사이드바, 상단 바에 같은 형식으로 보이고 기본은 `SECTION`이다.
11. 강의의 `elements/`에서 도구 요소와 강의 전용 요소를 상대 경로 하나로 가져오고, 같은 이름은 강의가 우선한다.
12. 미리보기의 확대 축소에서 슬라이드 전체가 함께 줄고 늘어난다.

**내보내기 준비 상태**
13. 마스터, layout, 슬롯, 층, 요소의 `at`이 모두 `id`를 가진 데이터로 선언되어 있다(export가 읽을 수 있음). `z-index` 숫자는 소스에 없다.

**문서**
14. 단계 7의 문서 갱신이 끝났고, 이 계획의 미결과 달라진 점이 노트에 기록되어 있다.

**직접 눈으로 확인할 것 (사용자)**
- 샘플 17장과 새 샘플(`ch.3_master`)의 모양
- 네 layout이 기존 PPTX와 비슷한 인상인지(렌더링해 본 적이 없어 좌표 대조만으로는 알 수 없다)
- 로고 표시와 `PromptBox`, `Chip`의 모양

## 6. 위험과 대응

| 위험 | 대응 |
|---|---|
| 샘플의 모습이 바뀜(주색 변경, 띠 추가) | ADR-10에서 예상한 변화이다. 단계 3 완료 기준에서 "바뀐 모습"을 확인 대상으로 한다 |
| `Slide`가 자식을 훑는 방식은 래퍼 컴포넌트(강의 전용 요소)의 자식을 알아보지 못한다 | `slotKinds`가 없고 `at`도 없는 자식은 `free` 슬롯으로 보낸다. 래퍼가 `slotKinds`를 다시 내보내게 한다. 단계 6에서 강의 요소로 확인한다 |
| `export *`와 같은 이름의 우선순위가 도구 체인(TypeScript 7, Vite 8)에서 기대와 다름 | 단계 6에서 먼저 시험한다. 안 되면 강의 요소 index가 도구 요소를 이름으로 하나씩 다시 내보내는 방식으로 바꾸고 ADR-9를 고친다 |
| 이미지를 마스터 폴더에서 import할 때 타입 선언이 없음 | `vite/client` 타입(`tsconfig`의 `types`에 이미 있음)으로 `*.svg`, `*.png` import가 된다. 안 되면 선언 파일 추가 |
| 그림자와 자유형 도형의 CSS 표현이 PPTX와 달라 보임 | 렌더링한 PPTX와 비교하지 못했다. 사용자의 눈 확인 항목으로 두고, 어긋나면 값을 조정한다 |
| 줄바꿈 문자 혼재(`LF`/`CRLF`) 경고 | 이번 작업과 별개이다. 필요하면 `.gitattributes` 추가를 별도 결정으로 다룬다 |
| 테스트 체계가 없어 검증 로직(층 대체, 오류)이 화면 확인에 의존 | 검증 함수를 화면과 분리된 순수 함수로 둔다. 필요하면 Vite의 서버 렌더링(`ssrLoadModule`)으로 한 번 실행해 확인한다. 테스트 도구(vitest 등) 도입은 별도 결정이다 |

## 7. 구현 중 사용자 결정이 필요한 것

- 요소 → 슬롯 매핑 규칙과 layout id, `sectionLabel` 표시 형식(3번 절의 제안)
- `title` layout의 `subtitle` 슬롯 위치(PPTX에 없는 값)
- `courses/sample`에 `ch.3_master`를 추가해 샘플의 슬라이드 수가 늘어나는 것
- 테스트 도구 도입 여부
