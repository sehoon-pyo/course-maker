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

/** 문장 안에서 서식이 바뀌는 조각. 공백은 문자열에 직접 포함한다. */
export type Inline = string | Badge | Bold | Code;

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

export const badge =(text: string, color: BadgeColor): Badge => ({ kind: "badge", text, color });
export const bold = (text: string): Bold => ({ kind: "bold", text });
export const code = (text: string): Code => ({ kind: "code", text });
