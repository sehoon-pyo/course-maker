import { Chip, Slide, Text, Title } from "@/elements";
import file from "../../../assets/icon-file.svg";
import terminal from "../../../assets/icon-terminal.svg";

const text = {
  title: "Chip: 글자에 맞춰 폭이 정해진다",
  note: "폭을 주지 않으면 글자 길이에 따라 달라집니다.",
  short: "/bg",
  mid: "ctrl + x",
  file: "CLAUDE.md",
  long: "claude agents --verbose",
};

export default function ElementsChips() {
  return (
    <Slide layout="title-only">
      <Title value={text.title} />
      <Text at={{ x: 120, y: 240, w: 1200 }} size={36} value={text.note} />
      <Chip at={{ x: 120, y: 340 }} value={text.short} />
      <Chip at={{ x: 420, y: 340 }} icon={terminal} value={text.mid} />
      <Chip at={{ x: 120, y: 460 }} icon={file} value={text.file} />
      <Chip at={{ x: 520, y: 460 }} icon={terminal} value={text.long} />
    </Slide>
  );
}
