export type BadgeColor = "green" | "red" | "blue" | "gray";

export interface Badge {
  kind: "badge";
  text: string;
  color: BadgeColor;
}
export interface Bold {
  kind: "bold";
  text: string;
}
export interface Code {
  kind: "code";
  text: string;
}
/** 문장 안에 들어가는 칩. 모양은 `Chip` 요소와 같다. */
export interface InlineChip {
  kind: "chip";
  text: string;
  /** 마스터 `icons`의 이름 또는 import한 이미지 주소 */
  icon?: string;
}

/** 글자 일부의 색. 색은 이름으로 쓰고 값은 마스터 tokens의 `--em-{이름}`이 정한다. */
export interface Em {
  kind: "em";
  text: string;
  color: string;
  bold?: boolean;
}
/** 문장 안에 들어가는 작은 그림. 높이는 글자에 맞춘다. */
export interface InlineIcon {
  kind: "icon";
  /** 마스터 `icons`의 이름 또는 import한 이미지 주소 */
  src: string;
}
/** 클릭하면 새 탭에서 열리는 링크 */
export interface Link {
  kind: "link";
  href: string;
  text: string;
}
/** 줄바꿈. 문자열의 `\n`은 줄을 바꾸지 않는다. */
export interface Br {
  kind: "br";
}

/** 문장 안에서 서식이 바뀌는 조각. 공백은 문자열에 직접 포함한다. */
export type Inline = string | Badge | Bold | Code | InlineChip | Br | Em | InlineIcon | Link;

/** 문자열이거나, 문자열과 인라인 요소가 섞인 배열 */
export type Sentence = string | Inline[];

/**
 * 태그드 템플릿으로 서식이 섞인 문장을 쓴다. 결과는 배열 방식과 같다.
 * t`타입은 ${badge("동적", "green")}으로 결정된다` → ["타입은 ", { kind: "badge", ... }, "으로 결정된다"]
 * `${...}`에는 badge, bold, code 같은 인라인 요소(또는 문자열)만 넣는다.
 */
export function t(strings: TemplateStringsArray, ...values: Inline[]): Inline[] {
  const out: Inline[] = [];
  strings.forEach((text, i) => {
    if (text) out.push(text);
    if (i < values.length) out.push(values[i]);
  });
  return out;
}

export const badge = (text: string, color: BadgeColor): Badge => ({ kind: "badge", text, color });
export const bold = (text: string): Bold => ({ kind: "bold", text });
export const code = (text: string): Code => ({ kind: "code", text });
/** `chip("/exit", "claude")`. 아이콘은 마스터 `icons`의 이름이고, 없으면 글자만 있는 칩이 된다. */
export const chip = (text: string, icon?: string): InlineChip => ({ kind: "chip", text, icon });
/** 글자 일부의 색. `em("2회 연속", "red")`, 굵게까지는 `em("KFC", "primary", { bold: true })` */
export const em = (text: string, color: string, o: { bold?: boolean } = {}): Em => ({ kind: "em", text, color, ...o });
/** 문장 안의 그림. `icon(boss)`처럼 import한 이미지 주소나 마스터 `icons`의 이름을 준다. */
export const icon = (src: string): InlineIcon => ({ kind: "icon", src });
/** 링크. `link("https://…")`는 주소를 그대로 보여 주고, `link("https://…", "다운로드")`는 글자를 보여 준다. */
export const link = (href: string, text?: string): Link => ({ kind: "link", href, text: text ?? href });
/** 줄바꿈. t`첫째 줄${br()}둘째 줄` */
export const br = (): Br => ({ kind: "br" });
