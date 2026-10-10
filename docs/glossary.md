# 용어사전

이 프로젝트에서 쓰는 용어의 정의입니다. 문서, 코드, 대화에서 같은 이름을 같은 뜻으로 씁니다. 결정 근거는 [`docs/adr/`](./adr/)를 참고하세요.

## 1. 구조 용어

계층은 `course → chapter → section → slide → element`입니다.

| 용어 | 뜻 | 폴더 이름 | 비고 |
|---|---|---|---|
| **course** | 하나의 전체 강의. 최상단 단위 | `courses/{강의}/` | 강의마다 별도 git 저장소 |
| **chapter** | 실제 파일로 배포하는 단위 | `ch.N_{이름}/` | 이름은 가칭. 순서는 강의 `meta.ts`의 `chapters` 배열이 정함 |
| **section** | 수업 주제 단위 | `sec.N_{이름}/` | PowerPoint의 구역(Section)과 같은 개념. 순서는 chapter `meta.ts`의 `sections` 배열이 정함 |
| **slide** | 슬라이드 한 장. 파일 하나(`index.tsx`). **크기는 1920×1080px 고정(16:9)**이며 HTML, PPTX, PDF 모든 출력에서 같음 | `sl.N_{이름}/` | 순서는 section `meta.ts`의 `slides` 배열이 정함 |
| **element** | 슬라이드를 구성하는 요소 (제목, 불릿, 도형, 그림, 칩, 뱃지 등) | | |

- **순서는 항상 상위 폴더의 `meta.ts` 배열이 정합니다.** 폴더 이름의 번호(`N`)는 정리용이며 순서의 기준이 아니고, 번호 없이(`ch.intro`) 또는 접두사 없이(`intro`) 써도 됩니다. 화면에는 접두사와 번호를 뗀 이름이 보입니다.
- 화면의 section 번호(`SECTION 1`)는 chapter 안에서의 section 순서입니다. `SECTION`은 강의 `meta.ts`의 `sectionLabel`로 바꿀 수 있습니다(`UNIT`, `MODULE` 등).
- **숨김 슬라이드**: `slides`(또는 `head`, `tail`)에서 `{ id, hidden: true }`로 표시한 슬라이드. 미리보기에서는 보이고, 내보낼 때(HTML, PPTX, PDF)만 빠집니다. PowerPoint의 숨기기 슬라이드와 같은 개념이지만 **번호는 매기지 않습니다**(하단은 `숨김 / N`).
- **head, tail**: chapter 바로 아래에서 section의 앞(`head`: 대제목, 목차)과 뒤(`tail`: 진행 현황 등)에 오는 슬라이드. chapter `meta.ts`에 적고 슬라이드 폴더는 chapter 폴더 바로 아래에 둡니다. section에 속하지 않으므로 `SECTION n`과 목차(`Toc`)에는 세지 않습니다.
- **번호**: chapter 안에서 `head` → section → `tail` 순서로 1부터 이어서 매깁니다(숨김 제외). 뷰어의 사이드바와 하단(`n / N`)이 이 번호를 씁니다. 슬라이드 위에 그리는 페이지 번호는 쪽번호 layout을 만들 때 추가합니다.
- **강의 전용 요소**: 특정 강의에서만 쓰는 요소. `courses/{강의}/elements/`에 두고, 도구의 요소를 다시 내보내면서 같은 이름은 강의 것이 우선합니다.

## 2. 슬라이드 마스터

| 용어 | 뜻 |
|---|---|
| **slide-master** | 모든 슬라이드에 공통으로 적용되는 틀. **PowerPoint의 슬라이드 마스터와 같은 개념**. 슬라이드의 디자인(배경, layout, 색, 크기, 요소의 모양)을 한곳에서 정함. `defineMaster`로 정의하고 안에 `tokens`, `background`, `layouts`가 들어 있음 |
| **background** | 아래에서 위로 쌓이는 **층(layer)의 배열**. 층은 `color`, `image`, `shape`, `text` 중 하나이고 `id`를 가짐. master에 기본값이 있고, `layout`마다 가질 수 있음 |
| **layout** | 영역을 나누는 배치 틀. `default` 마스터는 `title`(대제목), `content`(제목과 본문), `title-only`(제목만 있는 컨텐츠), `toc`(목차). 슬롯, 장식, 배경(선택)을 가짐 |
| **slot** | layout이 정해 둔 자리. 종류는 `title`, `subtitle`, `body`, `free`, `list`이고 슬라이드 크기(1920×1080) 기준 px의 `x, y, w, h`를 가짐. 슬라이드의 요소가 종류에 따라 자동으로 들어감 |
| **list 슬롯** | 같은 모양이 반복되는 줄(목차의 항목)을 한 번에 정하는 슬롯. `rows`, `pitch`, `columns`를 가짐 |
| **쌓는 단계** | `background` < `layout`(장식) < `element`(슬라이드의 요소) 세 단계. 고정된 순서이고 한 단계는 다른 단계를 넘지 못함. 단계 안의 순서는 배열(작성) 순서이며 `z-index` 숫자를 소스에 쓰지 않음 |
| **토큰 (tokens)** | 마스터가 정하는 CSS 변수 값(색, 크기, 간격 등). 요소는 변수만 읽음. 색을 쓸 때는 직접 값이나 토큰 이름(`primary` = `--color-primary`)을 쓸 수 있음 |
| **글로우 (glow)** | 도형이나 글자 둘레로 빛이 번지는 효과(PowerPoint의 "네온"). 도형은 `Shape.glow`, 글자는 `TextStyle.glow`. 반경(px)과 알파를 포함한 색을 가짐 |
| **at** | 요소의 위치. 슬라이드 기준 px의 `{ x, y, w, h }`. 있으면 슬롯 없이 그 자리에 놓이고, 쌓는 순서는 작성 순서 |
| **마스터 id** | 마스터를 가리키는 이름. 마스터 폴더 이름과 같음 |

- `layout`의 `background`는 기본적으로 master의 `background`를 **상속**하고, 필요할 때만 layout에서 지정합니다. 지정하면 **같은 `id`의 층은 그 자리에서 대체**하고, 새 `id`는 위에 추가하고, `{ id, remove: true }`는 층을 뺍니다.
- **마스터는 course 단위로 고릅니다.** 강의 `meta.ts`의 `master`로 지정하고, 없으면 `default`입니다.
- 마스터 id를 찾는 순서는 ① `courses/{강의}/masters/{id}/`(강의 전용) → ② `src/masters/{id}/`(도구 제공)이며, 같은 id가 양쪽에 있으면 강의 전용이 우선합니다.

## 3. 작성 용어

| 용어 | 뜻 |
|---|---|
| **meta.ts** | course, chapter, section 폴더에 있는 정보 파일. `title`과, 하위 폴더 이름을 표시 순서대로 나열한 배열(course는 `chapters`, chapter는 `sections`, section은 `slides`)을 가짐. course의 `meta.ts`는 `master`, `sectionLabel`도 가질 수 있음 |
| **text 객체** | 슬라이드 파일 맨 위에 모아 둔 문구. 문자열, `t` 템플릿, `badge()` 같은 헬퍼 호출만 넣고 로직은 넣지 않음 |
| **인라인 서식** | 한 문장 안에서 서식이 바뀌는 조각. `t` 템플릿으로 씀 (`t`타입은 ${badge("동적", "green")}으로 결정`) |
| **t** (태그드 템플릿) | 문장을 한 줄로 쓰고 `${ }`에 인라인 요소를 넣으면, 글 순서대로 끼워 넣어 문자열과 인라인 요소를 섞은 배열로 바꿔 주는 함수. 이 배열을 렌더러가 읽어 그림 |
| **badge / bold / code** | 지금 쓸 수 있는 인라인 요소. 뱃지(색은 `green`, `red`, `blue`, `gray`), 굵은 글씨, 코드 모양 |
| **원본 (SSOT)** | 슬라이드의 TSX 파일. 모든 수정은 원본에서만 함 |

## 4. 출력과 미리보기

| 용어 | 뜻 |
|---|---|
| **출력물** | 원본에서 만들어지는 결과물. HTML(최종 강의자료), PPTX(납품자료), PDF(수강생 배포용). 모두 직접 편집하지 않고 원본에서 다시 생성함 (지금은 HTML만 만들 수 있고 PPTX, PDF는 아직 없음. 내보내기 버튼은 `courses/{강의}/export/{연월일시분초}/`에 저장함) |
| **미리보기 창** | 개발 중에 슬라이드를 브라우저에서 확인하는 화면 전체. 사이드바, 상단 바, 슬라이드 미리보기 영역을 포함함. export에는 슬라이드만 들어가고 사이드바, 상단 바는 포함되지 않음 |
| **슬라이드 미리보기 영역** (`slide-preview-area`) | 미리보기 창 안에서 **슬라이드를 창 크기에 맞춰 비율 유지로 축소해서 보여 주는 영역**. 슬라이드 자체가 아니라 슬라이드를 보여 주는 영역이며, 미리보기에서만 있음 (export에는 없음) |
| **목차** | 미리보기 창의 왼쪽 사이드바. 선택된 chapter의 section → slide를 보여 줌 |

## 5. 접두사 규칙

PowerPoint나 DOM에만 있는 개념은 우리 용어와 헷갈리지 않도록 **필요할 때** 앞에 접두사를 붙입니다. 접두사가 없으면 우리 구조의 용어입니다.

| 표기 | 의미 |
|---|---|
| `layout`, `element`, `slide-master` | 우리 구조의 용어 |
| `pptx layout`, `pptx master` | PPTX 고유 개념 |
| `dom element` | DOM 고유 개념 |
