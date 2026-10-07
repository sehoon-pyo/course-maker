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

export const badge = (text: string, color: BadgeColor): Badge => ({ kind: "badge", text, color });
export const bold = (text: string): Bold => ({ kind: "bold", text });
export const code = (text: string): Code => ({ kind: "code", text });
