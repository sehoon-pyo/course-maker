import { Chip, type ChipProps } from "@/elements";
import icon from "../assets/icon-terminal.svg";

/** 터미널 아이콘이 붙은 칩(터미널에서 실행하는 명령). */
export function TerminalChip(props: Omit<ChipProps, "icon">) {
  return <Chip {...props} icon={icon} />;
}
TerminalChip.slotKinds = Chip.slotKinds;
