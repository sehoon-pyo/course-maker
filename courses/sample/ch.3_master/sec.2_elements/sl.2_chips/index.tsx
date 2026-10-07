import { Chip, ClaudeChip, FileChip, Slide, TerminalChip, Text, Title } from "../../../elements";

const text = {
  title: "Chip: 글자에 맞춰 폭이 정해진다",
  note: "폭을 주지 않으면 글자 길이에 따라 달라집니다. 아이콘은 있어도 되고 없어도 됩니다.",
  plain: "아이콘 없는 Chip",
  slash: "/bg",
  shortcut: "ctrl + x",
  file: "CLAUDE.md",
  terminal: "claude agents --verbose",
};

export default function ElementsChips() {
  return (
    <Slide layout="title-only">
      <Title value={text.title} />
      <Text at={{ x: 120, y: 240, w: 1500 }} size={36} value={text.note} />
      <Chip at={{ x: 120, y: 340 }} value={text.plain} />
      <ClaudeChip at={{ x: 120, y: 460 }} value={text.slash} />
      <ClaudeChip at={{ x: 420, y: 460 }} value={text.shortcut} />
      <FileChip at={{ x: 120, y: 580 }} value={text.file} />
      <TerminalChip at={{ x: 520, y: 580 }} value={text.terminal} />
    </Slide>
  );
}
