// sample2 강의의 요소. 도구의 요소를 모두 다시 내보내고 이 강의의 요소를 더한다.
// 슬라이드는 `import { Slide, Title, Bullets, CodeChip } from "../../../elements"` 한 줄로 둘을 함께 가져온다.
export * from "@/elements";

// 같은 이름(Bullets)은 명시적으로 내보낸 이 강의의 것이 `export *`의 도구 것보다 우선한다.
export { Bullets } from "./Bullets";
export { CodeChip } from "./CodeChip";
