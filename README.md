# course-maker

## 1. 소개

강의자료를 쉽게 만들도록 도와주는 도구입니다. 슬라이드를 TSX 파일로 작성하고, 브라우저의 미리보기 창에서 바로 확인합니다. Claude Code 같은 AI 도구에 슬라이드 수정을 시킬 수도 있습니다.

![미리보기 화면](docs/images/preview.png)

- 슬라이드는 16:9(1920×1080) 한 장이 TSX 파일 하나입니다.
- 강의 내용은 `courses/` 아래에서 강의별로 따로 관리합니다.
- 레포지토리를 내려받아 **내 컴퓨터에서** 사용하는 도구입니다. 서버에 배포하는 서비스가 아닙니다.

## 2. 현재 상태

| 기능 | 상태 |
|---|---|
| 미리보기 창 (목차, 강의/chapter 선택, 이전/다음, 방향키 이동) | 사용 가능 |
| 파일을 고치면 미리보기에 바로 반영 | 사용 가능 |
| 슬라이드 요소: 제목, 문단, 불릿, 인라인 서식(뱃지, 굵게, 코드) | 사용 가능 |
| 단일 HTML 파일로 내보내기 | 아직 없음 |
| PPTX로 내보내기 | 아직 없음 |
| PDF로 내보내기 | 아직 없음 |
| 슬라이드 마스터, 레이아웃 | 아직 없음 |

아직 개발 중인 버전입니다. **도구가 바뀌면 이미 만든 강의가 동작하지 않을 수 있습니다.** 정식 버전이 나오면 메신저로 알려 드립니다.

## 3. 준비물

- **Node.js v20.19.0 이상 (v21 제외), 또는 v22.12.0 이상**. 사용하는 도구(Vite 8 등)가 요구하는 최소 버전입니다. 직접 확인한 버전은 v24.19.0뿐이고, 그보다 낮은 버전은 도구가 지원한다고 밝힌 범위일 뿐 이 프로젝트에서 시험해 보지는 않았습니다.
  - `.nvmrc`에 `24.19.0`(확인한 버전)이 적혀 있어 nvm, fnm 같은 버전 관리 도구에서 참고할 수 있습니다. 강제하지는 않습니다.
  - `package.json`의 `engines`와 `.npmrc`의 `engine-strict=true` 때문에 위 범위보다 낮은 버전에서는 `npm install`이 오류를 내고 멈춥니다.
  - 확인: `node -v`
- **Git**
- **에디터**: VS Code 등 TSX 파일을 편집할 수 있는 것
- **Claude Code** (선택): AI에게 슬라이드 작성과 수정을 시킬 때 사용합니다.
- **OS**: Windows에서만 사용해 봤습니다. 다른 OS는 확인하지 못했습니다.

## 4. 5분 시작하기

```bash
git clone https://github.com/sehoon-pyo/course-maker.git
cd course-maker
npm install
npm run dev
```

이 저장소는 **비공개(private)**입니다. 사용 승인을 받아 저장소에 초대된 GitHub 계정으로 로그인한 상태에서만 `git clone`이 됩니다. 초대받지 않았다면 저장소 주소가 `404`로 보입니다.

터미널에 나오는 주소(기본값 `http://localhost:5173/`)를 브라우저에서 열면 샘플 강의가 보입니다.

- 왼쪽 위의 ☰ 버튼으로 목차를 접고 펼 수 있습니다.
- 상단 바에서 강의와 chapter를 고를 수 있습니다.
- 슬라이드 이동은 화면 아래의 이전/다음 버튼이나 방향키(← →)로 합니다.
- `courses/sample`의 슬라이드 파일을 고치고 저장하면 화면이 바로 바뀝니다.

## 5. 프로젝트 구조

```
course-maker/
├─ src/                    도구의 소스 (미리보기 앱)
│  ├─ elements/            슬라이드에서 쓰는 요소(Title, Bullets 등)와 인라인 서식
│  ├─ preview/             미리보기 창 (사이드바, 상단 바, 슬라이드 표시)
│  ├─ masters/             도구가 제공하는 슬라이드 마스터 (아직 구현되지 않음)
│  │  ├─ default/          기본 마스터. 폴더 이름이 마스터 id
│  │  └─ ...               마스터를 추가하려면 폴더를 추가
│  ├─ courses.ts           courses/ 폴더를 읽어 목차 트리를 만듦
│  ├─ types.ts             meta.ts의 타입
│  ├─ constants.ts         슬라이드 크기 (1920×1080)
│  └─ styles.css           폰트와 테마 값
│
├─ courses/                강의가 들어가는 곳 (강의 폴더마다 git 저장소를 만들어야 함)
│  ├─ sample/              예제 강의 (도구에 포함, 별도 저장소 아님)
│  ├─ sample2/             예제 강의 (도구에 포함, 별도 저장소 아님)
│  └─ my-course/           ← ★ 내 강의 (현재 프로젝트는 이 폴더를 무시함)
│     ├─ .git/             이 폴더에서 `git init` 한 별도 저장소
│     ├─ meta.ts           강의 제목, chapter 순서(`chapters`), 쓸 슬라이드 마스터 id (`master`, 없으면 default), section 이름(`sectionLabel`)
│     ├─ masters/          이 강의 전용 슬라이드 마스터 (선택, 아직 구현되지 않음)
│     └─ ...               chapter, section, slide 구조는 아래 6번에 써 있음
│
├─ assets/fonts/           NanumSquare R, B
├─ docs/
│  ├─ notes/               논의 기록
│  └─ adr/                 결정 기록
├─ CLAUDE.md               AI 도구가 읽는 프로젝트 안내
└─ index.html, package.json, tsconfig.json, vite.config.ts
```

위 그림의 `courses/my-course/` 안쪽(chapter, section, slide)의 자세한 폴더 구조는 **아래 [6. 내 강의 만들기](#6-내-강의-만들기)에 써 있습니다.**

**슬라이드 마스터의 위치** (아직 구현되지 않았고, 정해 둔 구조입니다)

- 도구가 제공하는 마스터: `src/masters/{마스터 id}/`
- 강의 전용 마스터: `courses/{강의}/masters/{마스터 id}/`
- 강의 하나는 **마스터 하나만** 씁니다. 강의 `meta.ts`의 `master`로 고르고, 없으면 `default`입니다.
- 마스터 id를 찾는 순서는 **① 강의 전용(`courses/{강의}/masters/`) → ② 도구 제공(`src/masters/`)** 입니다. 같은 id가 양쪽에 있으면 강의 전용이 우선합니다.

**`courses/` 아래에 강의를 만들면, 강의마다 별도의 git 저장소를 만들어야 합니다.**

```bash
cd courses/my-course
git init
```

- 도구 저장소는 `sample`과 `sample2`만 추적하고 `courses/` 아래의 나머지는 모두 무시합니다. 그래서 **강의 폴더에 git 저장소를 만들지 않으면 내 강의는 어디에도 기록되지 않습니다.** (변경 이력도, 백업도 없습니다.)
- 강의마다 저장소가 따로 있으면 도구를 업데이트(`git pull`)해도 내 강의 파일과 섞이지 않고, 강의 저장소를 비공개로 둘 수도 있습니다.

## 6. 내 강의 만들기

### 6-1. 강의 폴더 만들기

가장 쉬운 방법은 샘플을 복사하는 것입니다.

```bash
# bash
cp -r courses/sample courses/my-course

# PowerShell
Copy-Item -Recurse courses/sample courses/my-course
```

복사한 폴더 안에서 **반드시 따로 git 저장소를 시작합니다.** (이유는 5번 프로젝트 구조 참고)

```bash
cd courses/my-course
git init
```

### 6-2. 폴더 구조

```
courses/my-course/                 강의 (course)
├─ meta.ts                         강의 제목과 chapter 순서
└─ ch.1_intro/                     chapter (배포 파일 하나가 될 단위)
   ├─ meta.ts                      chapter 제목과 section 순서
   └─ sec.1_variable/              section (수업 주제 단위)
      ├─ meta.ts                   section 제목과 슬라이드 순서
      └─ sl.1_title/               슬라이드 한 장
         └─ index.tsx
```

- **순서는 모두 상위 폴더의 `meta.ts`에 있는 배열이 정합니다.** 강의의 `chapters`, chapter의 `sections`, section의 `slides`입니다. 항목을 끼우거나 순서를 바꿀 때는 배열만 고치면 되고 폴더 이름을 바꾸지 않아도 됩니다.
- 폴더 이름의 번호(`ch.1_`, `sec.1_`, `sl.1_`)는 **정리용이며 순서를 정하지 않습니다.** `ch.intro`처럼 번호 없이 써도 되고 접두사 없이 `intro`로 써도 됩니다. 화면에는 접두사와 번호를 뗀 이름이 보입니다. (URL 해시는 폴더 이름 그대로입니다.)
- 화면의 `SECTION 1` 같은 번호는 폴더 번호가 아니라 chapter 안에서의 section 순서입니다.

### 6-3. meta.ts 예시

```ts
// courses/my-course/meta.ts
import type { CourseMeta } from "@/types";

export default {
  title: "내 강의",
  chapters: ["ch.1_intro", "ch.2_control"],     // chapter 표시 순서
  // sectionLabel: "UNIT",                      // section을 부르는 이름 (없으면 SECTION)
} satisfies CourseMeta;
```

```ts
// courses/my-course/ch.1_intro/meta.ts
import type { ChapterMeta } from "@/types";

export default {
  title: "1장 시작하기",
  sections: ["sec.1_variable", "sec.2_function"],   // section 표시 순서
} satisfies ChapterMeta;
```

```ts
// courses/my-course/ch.1_intro/sec.1_variable/meta.ts
import type { SectionMeta } from "@/types";

export default {
  title: "변수",
  slides: ["sl.1_title", "sl.2_definition", { id: "sl.3_extra", hidden: true }],   // 표시 순서
} satisfies SectionMeta;
```

**숨김 슬라이드**: `slides`의 항목을 `{ id, hidden: true }`로 쓰면 숨김입니다. **미리보기에서는 숨김 슬라이드도 보이고**(사이드바에 "숨김" 표시, 이전/다음에도 포함) HTML, PPTX, PDF로 내보낼 때만 빠집니다(내보내기는 아직 없습니다).

### 6-4. 슬라이드 예시

```tsx
// courses/my-course/ch.1_intro/sec.1_variable/sl.2_definition/index.tsx
import { Bullets, Slide, Title, badge, bold, code, t } from "@/elements";

const text = {
  title: "변수의 정의",
  items: [
    "값을 담는 이름표",
    t`타입은 ${badge("동적", "green")}으로 결정된다`,
    t`대입은 ${code("x = 10")} 처럼 ${bold("등호")}를 쓴다`,
  ],
};

export default function VariableDefinition() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
```

새 슬라이드를 만들면 section의 `meta.ts`의 `slides`에도 폴더 이름을 추가해야 목차에 나타납니다. chapter와 section도 마찬가지로 상위 `meta.ts`의 `chapters`, `sections`에 추가합니다. 폴더는 있는데 배열에 없거나, 배열에는 있는데 폴더가 없거나, 배열에 같은 이름이 둘이면 브라우저 콘솔에 경고가 나옵니다(앞의 두 경우 그 항목은 표시되지 않습니다).

## 7. 슬라이드 작성 가이드

- **슬라이드 한 장은 TSX 파일 하나**입니다.
- **문구는 파일 맨 위의 `text` 객체**에 모으고, 아래의 컴포넌트에서는 가져다 쓰기만 합니다. 문구만 고칠 때 파일 맨 위만 보면 됩니다.
- `text` 객체에는 문자열, `t` 템플릿, `badge()` 같은 헬퍼 호출만 넣고 **조건문이나 반복문 같은 로직은 넣지 않습니다.**

**쓸 수 있는 요소**

| 요소 | 용도 |
|---|---|
| `Slide` | 슬라이드 한 장의 바깥 틀 |
| `Title` | 제목 |
| `Paragraph` | 문단 |
| `Bullets` | 불릿 목록 |

**한 문장 안에서 서식을 섞기**: 템플릿 문자열 `t`로 문장을 한 줄로 쓰고, 서식이 필요한 곳에만 `${ }`로 아래 헬퍼를 넣습니다.

```ts
t`타입은 ${badge("동적", "green")}으로 결정된다`
```

- `${ }` 안에는 아래 헬퍼(`badge`, `bold`, `code`)나 문자열만 넣을 수 있습니다. 다른 값을 넣으면 타입 검사가 막습니다.
- 서식이 없는 문장은 `t` 없이 그냥 `"..."`로 씁니다.
- 공백은 글 안에 그대로 쓰면 됩니다.

| 헬퍼 | 결과 |
|---|---|
| `badge("텍스트", "green")` | 알약 모양 뱃지. 색은 `green`, `red`, `blue`, `gray` |
| `bold("텍스트")` | 굵은 글씨 |
| `code("텍스트")` | 코드 모양 |

**글꼴**은 NanumSquare의 R(보통)과 B(굵게)만 씁니다. 슬라이드 크기는 16:9(1920×1080)입니다.

## 8. 용어

| 용어 | 뜻 |
|---|---|
| course | 하나의 전체 강의. 폴더 하나, 저장소 하나 |
| chapter | 실제 파일로 배포하는 단위 (이름은 가칭) |
| section | 수업 주제 단위. PowerPoint의 구역(Section)과 같은 개념 |
| slide | 슬라이드 한 장 |
| element | 슬라이드를 구성하는 요소 (제목, 불릿, 그림, 표 등). 여러 개를 묶은 group도 가능 |
| slide-master | 모든 슬라이드에 공통으로 적용되는 틀. PowerPoint의 슬라이드 마스터와 같은 개념 (아직 구현되지 않음) |
| layout | slide-master 안의 영역 배치 틀 (아직 구현되지 않음) |

PowerPoint나 DOM에만 있는 개념은 `pptx layout`, `dom element`처럼 앞에 `pptx`, `dom`을 붙여 구분합니다. 전체 용어의 정의는 [`docs/glossary.md`](docs/glossary.md), 결정 내용은 [`docs/adr/`](docs/adr/)를 보세요.

## 9. 폰트와 라이선스

**폰트**: 슬라이드에는 네이버의 NanumSquare(R, B)를 씁니다. 파일은 `assets/fonts/`에 있습니다. 이 폰트의 배포처와 이용 조건은 [네이버 한글한글 아름답게 - 나눔글꼴](https://hangeul.naver.com/fonts/search?f=nanum)의 안내를 따릅니다.

**이 프로젝트의 사용 조건**: 저작권자가 **사용을 승인한 사람만** 사용할 수 있습니다. 승인 없이 복사, 수정, 배포, 사용할 수 없습니다.

## 10. 로드맵

- 단일 HTML 파일로 내보내기 (강의 chapter 하나가 파일 하나)
- PPTX로 내보내기
- PDF로 내보내기
- 슬라이드 마스터와 레이아웃
- 표, 그림 등 슬라이드 요소 추가
