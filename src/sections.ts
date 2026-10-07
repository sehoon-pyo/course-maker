/**
 * section의 번호표(예: `SECTION 1`, `UNIT 2`). 목차, 사이드바, 상단 바가 같은 형식을 쓴다.
 * 의존하는 모듈이 없어야 슬라이드 요소(목차)와 미리보기 창이 함께 가져올 수 있다.
 */
export const sectionTag = (label: string, no: number): string => `${label} ${no}`;
