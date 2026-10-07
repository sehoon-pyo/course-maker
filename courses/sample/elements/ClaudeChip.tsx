import { Chip, type ChipProps } from "@/elements";
import icon from "../assets/icon-claude.svg";

/** claude 이미지가 붙은 칩(슬래시 명령, 단축키). 도구의 `Chip`에 이 강의의 아이콘을 미리 정해 둔 변형이다. */
export function ClaudeChip(props: Omit<ChipProps, "icon">) {
  return <Chip {...props} icon={icon} />;
}
// 래퍼는 자기가 들어갈 슬롯 종류를 원래 요소와 같게 알린다.
ClaudeChip.slotKinds = Chip.slotKinds;
