# GitHub 이슈와 프로젝트 운영

이 문서는 GitHub 이슈(Issue)와 프로젝트(Project)에 일을 올리고 관리하는 방법을 정리한다. 용어의 정의는 [`glossary.md`](./glossary.md)가 기준이다.

- 저장소: `sehoon-pyo/course-maker` (공개)
- 프로젝트: 사용자 계정의 `course-maker` (#1, 비공개), https://github.com/users/sehoon-pyo/projects/1
- 이 문서의 명령어는 `gh`(GitHub CLI)를 쓴다. 문법은 PowerShell과 bash에서 모두 같고, 여러 줄 본문만 다르다(5번 참고).
- 확인한 것: 2026-10-08 기준 이슈, PR, 마일스톤은 0건이고 라벨은 GitHub 기본 10개뿐이다. 프로젝트는 항목이 0개이다. 아래의 라벨, 마일스톤, 템플릿은 **제안**이며 아직 만들지 않았다.

## 1. 역할 분담

| 대상 | 둘 곳 | 비고 |
|---|---|---|
| 논의, 검토 과정 | `docs/notes/` | 지금처럼 유지한다. |
| 결정된 사항 | `docs/adr/` | 지금처럼 유지한다. |
| 해야 할 일, 버그 | **이슈** | 상태(열림/닫힘)를 추적한다. |
| 진행 현황 | **프로젝트** | 이슈를 모아 보는 보드이다. |

- 노트와 ADR의 내용을 이슈에 복사하지 않는다. 이슈에는 **무엇을 할지**와 **완료 조건**만 쓰고, 맥락은 문서 경로로 링크한다(예: `docs/adr/[261008_002]_adr.md`).
- 노트의 미결 사항 중 실행할 항목만 이슈로 뽑는다. 이슈를 만들면 노트의 해당 행에 `#번호`를 적는다.
- 결정이 필요한 항목은 이슈로 만들기 전에 노트에서 논의하고 ADR로 확정한다. 확정되지 않은 항목은 이슈에 `needs-decision` 라벨을 붙여 구분한다.

## 2. 공개 저장소 주의

저장소가 공개이므로 이슈, PR, 커밋은 누구나 읽을 수 있다.

- `courses/sample`, `courses/sample2` 외의 **개인 강의 내용을 이슈에 적지 않는다.** 슬라이드 캡처, 강의 제목, 수강생 정보도 같다.
- 버그 재현에는 `sample` 강의의 슬라이드를 쓴다. 개인 강의에서만 재현되면 구조만 남기고 내용은 뺀다.
- 개인 경로(`C:\Users\...`), 토큰, 이메일은 로그를 붙여 넣기 전에 지운다.
- 프로젝트는 저장소와 별개로 공개 범위를 정한다(지금은 비공개). 공개로 바꾸면 보드의 항목 제목도 공개된다.

## 3. 라벨

GitHub 기본 라벨 10개는 쓰지 않을 것을 정리하고, 아래 두 축으로 만든다.

**종류**: 이슈마다 하나

| 라벨 | 뜻 | 색 |
|---|---|---|
| `feat` | 새 기능, 요소 추가 | `#a2eeef` |
| `bug` | 동작이 잘못됨 (기본 라벨 유지) | `#d73a4a` |
| `docs` | 문서 | `#0075ca` |
| `chore` | 설정, 정리, 의존성 | `#cfd3d7` |
| `needs-decision` | 결정(노트, ADR)이 먼저 필요함 | `#fbca04` |

**영역**: 해당하는 것에 하나 이상

| 라벨 | 대상 | 색 |
|---|---|---|
| `area:preview` | 미리보기 창 (`src/preview/`) | `#bfdadc` |
| `area:elements` | 슬라이드 요소 (`src/elements/`) | `#bfdadc` |
| `area:masters` | 슬라이드 마스터, layout (`src/masters/`) | `#bfdadc` |
| `area:export` | HTML, PPTX, PDF 내보내기 | `#bfdadc` |
| `area:docs` | 문서, 용어 | `#bfdadc` |

### 만들기

```bash
# 기본 라벨 정리: 쓰지 않을 것은 지운다 (bug는 유지). gh label delete는 이름 하나만 받는다
for l in enhancement documentation duplicate "good first issue" "help wanted" invalid question wontfix accessibility; do
  gh label delete "$l" --yes
done

# 종류
gh label create feat           --color a2eeef --description "새 기능, 요소 추가"
gh label create docs           --color 0075ca --description "문서"
gh label create chore          --color cfd3d7 --description "설정, 정리, 의존성"
gh label create needs-decision --color fbca04 --description "결정(노트, ADR)이 먼저 필요함"

# 영역
gh label create "area:preview"  --color bfdadc --description "미리보기 창"
gh label create "area:elements" --color bfdadc --description "슬라이드 요소"
gh label create "area:masters"  --color bfdadc --description "슬라이드 마스터, layout"
gh label create "area:export"   --color bfdadc --description "HTML, PPTX, PDF 내보내기"
gh label create "area:docs"     --color bfdadc --description "문서, 용어"
```

- 이슈를 만들 때 없는 라벨을 쓰면 `gh issue create`가 실패한다. 라벨을 먼저 만든다.
- 라벨은 이슈가 10개쯤 쌓인 뒤 부족한 분류만 추가한다. 처음부터 늘리지 않는다.

## 4. 마일스톤

마일스톤은 README 10번 로드맵의 묶음에 맞춘다. 마감일은 정하지 않는다(필요해지면 추가).

| 마일스톤 | 로드맵 항목 |
|---|---|
| `단일 HTML export` | 단일 HTML 파일로 내보내기 |
| `PPTX export` | PPTX로 내보내기, PowerPoint 슬라이드 마스터로 만들기 |
| `PDF export` | PDF로 내보내기 |
| `슬라이드 요소 확장` | 표 |
| `날짜, 바닥글, 번호` | 날짜, 바닥글, 슬라이드 번호 |

```bash
gh api repos/{owner}/{repo}/milestones -f title="단일 HTML export" -f description="강의 chapter 하나가 파일 하나인 단일 HTML 내보내기"
gh api repos/{owner}/{repo}/milestones -f title="PPTX export"
gh api repos/{owner}/{repo}/milestones -f title="PDF export"
gh api repos/{owner}/{repo}/milestones -f title="슬라이드 요소 확장"
gh api repos/{owner}/{repo}/milestones -f title="날짜, 바닥글, 번호"

# 확인
gh api repos/{owner}/{repo}/milestones --jq '.[]|[.number,.title,.state]|@tsv'
```

`gh issue create`에는 `--milestone "제목"`으로 연결한다(제목이 정확히 같아야 한다).

## 5. 이슈 올리기

### 5-1. 제목과 본문 규칙

- 제목과 본문은 한글로 쓴다. 코드 식별자와 기술 용어는 원형을 유지한다(CLAUDE.md의 규칙과 같다).
- 제목은 **한 가지 일**을 한 줄로 쓴다. 예: `표 요소 추가`, `Toc가 숨김 슬라이드를 세는 문제`. 접두사(`[feat]` 등)는 라벨이 하므로 쓰지 않는다.
- 용어는 `glossary.md`를 따른다(course, chapter, section, slide, element, 슬라이드 마스터, layout, 슬롯).
- **완료 조건**을 체크리스트로 쓴다. 닫을 때 기준이 된다.
- 논의와 결정의 근거는 문서 경로로 링크한다. 문서에 없는 사실은 "확인하지 못함"으로 쓴다.

### 5-2. 기능 이슈 양식

```markdown
## 배경
왜 필요한지 1~3줄.

## 원하는 동작
사용자(강의 작성자)가 어떻게 쓰게 되는지. 슬라이드 TSX 사용 예시가 있으면 코드로 쓴다.

## 관련 문서
- docs/notes/[YYMMDD_NNN]_note.md (해당 항목)
- docs/adr/[YYMMDD_NNN]_adr.md (ADR-N)

## 완료 조건
- [ ] 구현
- [ ] `npm run typecheck` 통과
- [ ] sample 강의에서 미리보기로 확인
- [ ] README, glossary.md, CLAUDE.md 갱신 (구조, 용어, 규칙이 바뀌면)
```

### 5-3. 버그 이슈 양식

```markdown
## 현상
실제로 일어난 일.

## 기대 동작
원래 어떻게 되어야 하는지.

## 재현 방법
1. `npm run dev`
2. `courses/sample/...` 의 어느 슬라이드를 연다
3. ...

## 환경
- OS / 브라우저
- Node.js 버전 (`node -v`)
- 커밋 (`git rev-parse --short HEAD`)

## 비고
콘솔 경고나 오류 메시지 (개인 경로는 지운다).
```

### 5-4. 명령어

본문은 파일로 만들어 `--body-file`로 넘기는 방법이 PowerShell과 bash에서 모두 안전하다(따옴표, 줄바꿈 문제가 없다).

```bash
# 본문을 파일에 쓰고 올린다
gh issue create \
  --title "표 요소 추가" \
  --body-file body.md \
  --label feat --label area:elements \
  --milestone "슬라이드 요소 확장"
```

PowerShell은 줄 이음이 백틱(`` ` ``)이다. 한 줄로 써도 된다.

```powershell
gh issue create --title "표 요소 추가" --body-file body.md --label feat --label "area:elements" --milestone "슬라이드 요소 확장"
```

짧은 본문은 PowerShell의 single-quoted here-string으로 넘길 수 있다. 닫는 `'@`는 줄 맨 앞에 와야 한다.

```powershell
gh issue create --title "제목" --label chore --body @'
## 배경
...
'@
```

자주 쓰는 명령:

```bash
gh issue list                          # 열린 이슈
gh issue list --label "area:export"    # 라벨로 거르기
gh issue list --milestone "PPTX export"
gh issue view 12                       # 내용 보기
gh issue edit 12 --add-label bug --milestone "PDF export"
gh issue comment 12 --body "..."
gh issue close 12 --reason completed   # 또는 "not planned"
gh issue reopen 12
```

### 5-5. 노트에서 이슈로 옮기기

노트 `[261008_003]` 같은 미결 항목 표를 이슈로 만들 때의 순서이다.

1. 표에서 **지금 실행할 수 있는 항목**과 **결정이 필요한 항목**을 나눈다.
2. 상태가 `export 때`, `프로토타입 이후`처럼 시점이 정해진 항목은 이슈를 지금 만들지 않고 해당 마일스톤의 이슈 하나에 체크리스트로 묶는다. 잘게 쪼개 열어 두면 닫을 일이 없는 이슈가 쌓인다.
3. 결정이 필요한 항목은 `needs-decision` 라벨을 붙이고, 결정되면 ADR을 쓴 뒤 라벨을 뗀다.
4. 만든 이슈 번호를 노트의 행에 `#번호`로 적는다. 이전 기록의 서술은 고치지 않는다는 CLAUDE.md 규칙에 따라, 번호 표기만 추가하고 기존 문장은 건드리지 않는다.

## 6. 프로젝트 관리

### 6-1. 구성

- 프로젝트 하나(`course-maker`, #1)에 열 네 개 이하로 시작한다. 새 프로젝트를 만들면 `Status` 필드에 `Todo`, `In Progress`, `Done`이 기본으로 있다. 이것을 그대로 쓴다.
- 필드는 필요할 때 추가한다. 후보는 `Area`(단일 선택)와 `Size`(S/M/L)이다. 라벨의 `area:`와 겹치므로, 보드에서 영역별로 묶어 볼 필요가 생길 때만 추가한다.
- 보기(View)는 두 개를 만든다.
  - **Board**: `Status`별 칸반
  - **마일스톤별 표**: 마일스톤으로 묶은 Table

보기와 `Status` 옵션 편집, 내장 자동화(workflow)는 웹 UI에서 설정한다. `gh`에는 이를 바꾸는 명령이 있는지 **확인하지 못했다**.

- 권장 자동화: 이슈가 닫히면 `Done`으로 이동, 저장소의 새 이슈를 프로젝트에 자동 추가(Auto-add).
- 웹 UI 위치: 프로젝트 오른쪽 위 `···` → `Workflows`.

### 6-2. 명령어

프로젝트 명령은 토큰에 `project` 권한이 필요하다. 읽기만 하면 `read:project`로 되지만 항목 추가와 필드 생성은 `project`가 필요하다.

```bash
gh auth refresh -h github.com -s project   # 브라우저에서 코드를 입력해 승인
```

```bash
gh project list --owner sehoon-pyo
gh project view 1 --owner sehoon-pyo
gh project field-list 1 --owner sehoon-pyo

# 저장소에 프로젝트를 링크 (저장소의 Projects 탭에 보인다)
gh project link 1 --owner sehoon-pyo --repo sehoon-pyo/course-maker

# 이슈를 프로젝트에 추가
gh project item-add 1 --owner sehoon-pyo --url https://github.com/sehoon-pyo/course-maker/issues/12

# 항목 목록
gh project item-list 1 --owner sehoon-pyo

# 필드 추가 예 (Size)
gh project field-create 1 --owner sehoon-pyo --name "Size" --data-type SINGLE_SELECT --single-select-options "S,M,L"
```

- 이슈를 만들면서 바로 추가하는 방법: `gh issue create ... --project "course-maker"`. 사용자 소유 프로젝트는 제목으로 지정한다. `gh issue create --help`에 `--project <제목>` 옵션이 있는 것은 확인했지만(gh 2.100.0), 사용자 소유 프로젝트에서 실제로 동작하는지는 **시험하지 못했다**. 안 되면 만든 뒤 `item-add`를 쓴다. 이 옵션도 `project` 권한이 필요하다.
- `Status`를 명령어로 바꾸려면 `gh project item-edit`에 프로젝트, 항목, 필드, 옵션의 ID가 필요해 번거롭다. 칸반 보드에서 끌어 옮기거나 위 자동화를 쓰는 편이 낫다.

## 7. 브랜치, 커밋, PR과 이슈 연결

- 브랜치 이름에 이슈 번호를 붙인다. 현재 브랜치는 `feature/...`, `docs/...` 형식이다. 예: `feature/12-table-element`, `docs/15-github-guide`.
- 커밋 메시지는 한글로 쓴다. 이슈 번호는 본문 마지막 줄에 `#12`로 참조할 수 있다.
- PR 본문에 `Closes #12`를 쓰면 머지할 때 이슈가 자동으로 닫힌다. 여러 이슈는 `Closes #12, closes #13`처럼 각각 쓴다.
- `main`에는 직접 푸시하지 않고 PR로 머지한다.
- PR 양식(제안):

```markdown
## 변경 내용
-

## 관련 이슈
Closes #

## 확인
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] 미리보기에서 sample 강의 확인
- [ ] 문서 갱신 (README.md, docs/glossary.md, CLAUDE.md 중 해당하는 것)
```

테스트와 린트가 없으므로 확인 항목은 타입 검사, 빌드, 미리보기 확인이다.

## 8. 저장소에 넣을 파일 (아직 없음)

아래 파일을 `.github/`에 두면 GitHub 웹에서 이슈를 만들 때 양식이 뜬다. 현재 `.github/` 폴더가 없다.

```
.github/
├─ ISSUE_TEMPLATE/
│  ├─ feature.yml
│  ├─ bug.yml
│  └─ config.yml
└─ pull_request_template.md
```

### `feature.yml`

```yaml
name: 기능
description: 새 기능이나 요소 추가
labels: ["feat"]
body:
  - type: textarea
    id: background
    attributes:
      label: 배경
      description: 왜 필요한지
    validations:
      required: true
  - type: textarea
    id: behavior
    attributes:
      label: 원하는 동작
      description: 강의 작성자가 어떻게 쓰게 되는지. TSX 사용 예시가 있으면 함께
    validations:
      required: true
  - type: textarea
    id: docs
    attributes:
      label: 관련 문서
      description: docs/notes, docs/adr의 경로와 항목
  - type: textarea
    id: done
    attributes:
      label: 완료 조건
      value: |
        - [ ] 구현
        - [ ] npm run typecheck 통과
        - [ ] sample 강의에서 미리보기로 확인
        - [ ] README, glossary.md, CLAUDE.md 갱신 (해당하면)
```

### `bug.yml`

```yaml
name: 버그
description: 동작이 잘못됨
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        공개 저장소입니다. 개인 강의 내용, 개인 경로, 토큰은 적지 마세요. 재현은 sample 강의로 해 주세요.
  - type: textarea
    id: actual
    attributes:
      label: 현상
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 기대 동작
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 재현 방법
      value: |
        1. npm run dev
        2.
    validations:
      required: true
  - type: input
    id: env
    attributes:
      label: 환경
      description: OS, 브라우저, Node.js 버전, 커밋
```

### `config.yml`

```yaml
blank_issues_enabled: true
```

양식 없이 만드는 이슈도 허용한다. 양식을 강제하려면 `false`로 바꾼다. 이 저장소는 사용 조건상 승인한 사람만 쓰는 도구라, 외부 이슈는 허용한다(9번 참고).

### `pull_request_template.md`

7번의 PR 양식을 그대로 쓴다.

## 9. 운영 결정

| 항목 | 결정 |
|---|---|
| 외부 이슈 | 허용한다. 개인 강의 내용을 적지 않도록 `bug.yml`에 경고를 넣는다. 부담이 되면 저장소 설정에서 Issues를 닫고 비공개 프로젝트만 쓴다. |
| 프로젝트 공개 | 비공개로 둔다. 로드맵을 보여 줄 필요가 생기면 공개한다. |
| 이슈 번호와 노트 번호 | 노트(`[YYMMDD_NNN]`)와 이슈(`#N`)는 서로 링크만 하고 번호를 맞추지 않는다. |
| AI 작업 | 완료 조건이 구체적이면 이슈 URL만 줘도 작업할 수 있다. 외부에 올라가는 작업(이슈 생성, 푸시)은 사람이 확인한 뒤 한다. |

## 10. 시작 순서

1. `gh auth refresh -h github.com -s project`로 프로젝트 권한을 추가한다(3, 6번 명령에 필요).
2. 라벨과 마일스톤을 만든다(3, 4번).
3. `.github/` 양식을 추가한다(8번). PR로 올린다.
4. 노트 `[261008_003]`의 항목을 이슈로 옮긴다(5-5).
5. 프로젝트를 저장소에 링크하고 이슈를 추가한다. 웹 UI에서 자동화를 켠다(6번).
