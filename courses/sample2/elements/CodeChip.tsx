import { Chip, type ChipProps } from "@/elements";
import icon from "../assets/icon-code.svg";

/** 코드 아이콘이 붙은 칩. 도구의 `Chip`에 이 강의의 아이콘을 미리 정해 둔 변형이다. */
export function CodeChip(props: Omit<ChipProps, "icon">) {
  return <Chip {...props} icon={icon} />;
}
// 래퍼는 자기가 들어갈 슬롯 종류를 원래 요소와 같게 알린다.
CodeChip.slotKinds = Chip.slotKinds;
