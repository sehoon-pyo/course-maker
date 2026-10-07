import { Chip, type ChipProps } from "@/elements";
import icon from "../assets/icon-file.svg";

/** 파일 아이콘이 붙은 칩(파일 이름). */
export function FileChip(props: Omit<ChipProps, "icon">) {
  return <Chip {...props} icon={icon} />;
}
FileChip.slotKinds = Chip.slotKinds;
