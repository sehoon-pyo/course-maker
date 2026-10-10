/**
 * 아이콘을 이미지 주소로 바꾼다. 마스터 `icons`에 등록된 이름이면 그 주소를, 아니면 import한 이미지 주소로 보고 그대로 쓴다.
 * 등록되지 않은 이름(경로 문자가 없는 값)은 오타일 가능성이 커서 오류로 알린다.
 */
export function resolveIcon(icon: string | undefined, icons: Record<string, string>): string | undefined {
  if (icon === undefined) return undefined;
  if (icon in icons) return icons[icon];
  if (/^[\w-]+$/.test(icon)) {
    const names = Object.keys(icons);
    throw new Error(`[masters] 아이콘 "${icon}"이 마스터의 icons에 없습니다(등록된 이름: ${names.length > 0 ? names.join(", ") : "없음"}).`);
  }
  return icon;
}
