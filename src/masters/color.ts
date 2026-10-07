/**
 * 색을 CSS 값으로 바꾼다. 마스터 토큰 이름(`primary` → `--color-primary`)이면 CSS 변수로, 아니면 직접 값 그대로 쓴다.
 * 변수 이름을 쓰므로 마스터가 토큰을 바꾸면 이 색도 함께 바뀐다.
 */
export function resolveColor(value: string | undefined, tokens: Record<string, string>): string | undefined {
  if (value === undefined) return undefined;
  return `--color-${value}` in tokens ? `var(--color-${value})` : value;
}
