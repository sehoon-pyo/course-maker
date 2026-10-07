# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요
해당 프로젝트는 강의자료를 쉽게 만들도록 도와주는 도구이다. 레포지토리를 내려받아 로컬에서 사용한다. 서비스로 배포하지 않는다.

- 슬라이드를 TSX로 작성하고 브라우저 미리보기 창에서 확인한다. AI(Claude Code 등)가 로컬의 TSX를 직접 고치는 것이 기본 사용 방식이다.
- **원본(SSOT)은 슬라이드의 TSX**이다. HTML(최종 강의자료), PPTX(납품자료), PDF(수강생 배포용)는 모두 출력물이며, 직접 고치지 않고 원본에서 다시 생성한다.
- 기술 스택은 Vite + React + TypeScript이다. Node.js는 `^20.19.0 || >=22.12.0`.
- 아직 개발 중이다. 구현된 것은 미리보기 창, 슬라이드 마스터와 layout(강의 전용 마스터 포함), 요소(`Slide`, `Title`, `Paragraph`, `Bullets`, `Text`, `Shape`, `Image`, `Chip`, `PromptBox`, `Toc`), 강의 전용 요소, 인라인 서식, 숨김 슬라이드(미리보기)이다. **단일 HTML/PPTX/PDF export, 표, group, 자동 배치(Row/Column), 날짜/바닥글/슬라이드 번호는 아직 없다.** 현황과 로드맵은 `README.md`의 2번과 10번을 따른다.

## 명령어
- `npm run dev`: 개발 서버 (미리보기 창, 기본 `http://localhost:5173/`)
- `npm run typecheck`: `tsc --noEmit`
- `npm run build`: 타입 검사 후 Vite 빌드
- 테스트와 린트는 없다.

## 구조와 용어
계층은 `course → chapter → section → slide → element`이다. 용어의 정의는 `docs/glossary.md`가 기준이며, 코드와 문서에서 같은 이름을 같은 뜻으로 쓴다. PPTX나 DOM 고유 개념은 필요할 때 `pptx`, `dom` 접두사를 붙인다(예: `pptx layout`, `dom element`).

```
course-maker/
├─ src/                    도구의 소스 (미리보기 앱)
│  ├─ elements/            슬라이드에서 쓰는 요소와 인라인 서식 (index: Slide, Title 등 / free: Text, Shape, Image / widgets: Chip, PromptBox, Toc / slots: 슬롯 배치)
│  ├─ preview/             미리보기 창 (사이드바, 상단 바, 슬라이드 표시, 오류 경계)
│  ├─ masters/             슬라이드 마스터 (types, define: 검증과 상속, registry: 등록과 조회, MasterFrame, Layers)
│  │  ├─ default/          기본 마스터. 폴더 이름이 마스터 id
│  │  └─ ...               마스터를 추가하려면 폴더를 추가 (`_`로 시작하는 폴더는 등록하지 않음)
│  ├─ courses.ts           courses/ 폴더를 읽어 목차 트리를 만듦 (순서는 meta의 배열)
│  ├─ sections.ts          section 번호표(`SECTION 1`) 형식. 목차, 사이드바, 상단 바가 같이 씀
│  ├─ types.ts             meta.ts의 타입
│  ├─ constants.ts         슬라이드 크기 (1920×1080)와 기본값(마스터, layout, sectionLabel)
│  └─ styles.css           폰트, 미리보기 UI, 슬라이드 요소의 CSS (색, 크기 값은 마스터의 tokens가 정함)
│
├─ courses/                강의가 들어가는 곳 (강의 폴더마다 git 저장소를 만들어야 함)
│  ├─ sample/              예제 강의 (도구에 포함, 별도 저장소 아님)
│  ├─ sample2/             예제 강의 (도구에 포함, 별도 저장소 아님)
│  └─ my-course/           ← 내 강의 (현재 프로젝트는 이 폴더를 무시함)
│     ├─ .git/             이 폴더에서 `git init` 한 별도 저장소
│     ├─ meta.ts           강의 제목, chapter 순서(`chapters`), 쓸 슬라이드 마스터 id (`master`, 없으면 default), section 이름(`sectionLabel`, 없으면 SECTION)
│     ├─ masters/          이 강의 전용 슬라이드 마스터 (선택)
│     ├─ elements/         이 강의 전용 요소 (선택). 도구의 요소를 다시 내보내고 강의 요소를 더함
│     ├─ assets/           이 강의의 이미지(아이콘 등)
│     └─ ch.N_이름/sec.N_이름/sl.N_이름/index.tsx
│
├─ assets/fonts/           NanumSquare R, B
├─ docs/                   glossary.md, notes/(논의 기록), adr/(결정 기록)
└─ index.html, package.json, tsconfig.json, vite.config.ts
```

- 경로 별칭은 `@/`(= `src/`)이다.
- course, chapter, section 폴더에는 `meta.ts`가 있다(`title`와 하위 폴더 이름의 배열: course는 `chapters`, chapter는 `sections`, section은 `slides`).
- **순서는 모두 상위 `meta.ts`의 배열이 정한다. 폴더 이름의 번호(`ch.1_` 등)는 정리용이며 순서의 기준이 아니다**(번호 없이 `ch.intro`, 접두사 없이 `intro`도 된다). chapter, section, slide를 추가하면 폴더와 상위 배열을 둘 다 고친다. 어긋나면 콘솔에 경고가 나오고 배열에 없는 폴더는 표시되지 않는다.
- **숨김 슬라이드**는 section `meta.ts`의 `slides`에서 `{ id, hidden: true }`로 쓴다. 미리보기에서는 보이고 내보낼 때만 빠진다.
- **`courses/`에서 이 저장소가 추적하는 것은 `sample`, `sample2`뿐**이다. 나머지는 강의별 별도 git 저장소이므로 이 저장소에 커밋하지 않는다.
- **슬라이드 마스터**(`docs/adr/[261007_004]_adr.md`): 마스터는 course 단위로 하나만 고르고(`meta.ts`의 `master`, 없으면 `default`), id는 ① `courses/{강의}/masters/` → ② `src/masters/` 순서로 찾는다. 마스터는 `defineMaster({ tokens, background, layouts })`가 만든 데이터이고, 슬라이드의 디자인(배경, layout, 색, 크기, 요소의 모양)은 `styles.css`가 아니라 마스터가 정한다. 마스터는 `tokens` 10개를 반드시 정해야 한다(`REQUIRED_TOKENS`, `src/masters/define.ts`). `extendMaster`는 아직 없다.
- **그리는 순서**: `MasterFrame`이 마스터와 chapter 정보를 context로 내리고, `Slide`가 layout을 골라 background < layout(장식) < element 세 단계를 쌓임 맥락을 분리해 그린다. 단계 안의 순서는 배열(작성) 순서이고 소스에 `z-index` 숫자를 쓰지 않는다. 층, 슬롯, 요소에는 `id`를 둔다.
- **강의 전용 요소**: 슬라이드는 `../../../elements`(강의의 `elements/index.ts`)에서 가져오면 도구 요소와 강의 요소를 한 줄로 쓰고, 같은 이름은 강의 것이 우선한다. `@/elements`에서 가져오면 도구의 것이다. 래퍼 요소는 `slotKinds`를 원래 요소에서 다시 알려야 한다. 도구는 아이콘 이미지를 제공하지 않는다(강의의 `assets/`).

## 슬라이드 작성 규칙
- 슬라이드 한 장은 TSX 파일 하나이고, 크기는 1920×1080px(16:9) 고정이다.
- 문구는 파일 맨 위 `text` 객체에 모으고, 그 안에는 문자열, `t` 템플릿, `badge()` 같은 헬퍼 호출만 넣는다. 슬라이드에 조건문이나 반복문 같은 로직을 넣지 않는다.
- 문장 안에서 서식이 섞이면 `t` 태그드 템플릿으로 쓴다(``t`타입은 ${badge("동적", "green")}이다` ``). 서식이 없으면 일반 문자열로 쓴다. 배열 방식은 쓰지 않는다.
- 폰트는 NanumSquare R(400), B(700)만 쓰고 가짜 굵게를 쓰지 않는다. 색, 크기, 여백은 마스터의 `tokens`(CSS 변수)로 정의하고 요소의 CSS는 변수만 읽는다. Tailwind 같은 utility class는 쓰지 않는다.
- `<Slide layout="...">`으로 layout을 고른다(`title`, `content`(기본), `title-only`, `toc`). `Title`, `Paragraph`, `Bullets`, `Toc`는 슬롯에 자동으로 들어가고, `Text`, `Shape`, `Image`, `Chip`, `PromptBox`는 `at={{ x, y, w, h }}`(슬라이드 기준 px)로 위치를 준다. `Shape`와 `PromptBox`는 크기까지, `Chip`은 `x, y`만 준다. 색은 직접 값이나 토큰 이름(`primary` 등)을 쓴다.
- `Toc`는 항목을 직접 받지 않고 chapter의 section으로 자동으로 채운다.
- 새 요소나 인라인 요소는 필요할 때 하나씩 추가한다. 특정 강의에서만 쓰는 모양은 도구가 아니라 그 강의의 `elements/`에 둔다.

## 문서 규칙
- 논의는 `docs/notes/[YYMMDD_NNN]_note.md`, 결정된 사항만 `docs/adr/[YYMMDD_NNN]_adr.md`에 쓴다. 번호는 날짜 기준이고 같은 날 새 문서는 `NNN`을 1씩 올린다.
- 이전 결정을 바꾸면 이전 ADR의 상태 줄에 대체 관계를 표시한다. 이전 기록의 서술은 고치지 않는다.
- 구조, 용어, 규칙이 바뀌면 `README.md`, `docs/glossary.md`, 이 파일을 함께 맞춘다.
- 문서는 한글로 쓴다. 용어사전에는 쓰지 않는 용어를 적지 않는다.

## 규칙
- 커밋 메시지(제목과 본문)는 한글로 작성한다. 코드 식별자와 기술 용어는 원형을 유지한다.
- 코드 주석은 한글로, 이유를 설명하는 짧은 문장만 쓴다. 주변 코드의 이름 짓기와 스타일을 따른다.
- 구현하지 않았거나 확인하지 못한 것은 있다고 쓰지 않는다. 문서에도 "확인하지 못함"으로 적는다.
