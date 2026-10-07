import { ClaudeChip, Paragraph, Slide, TerminalChip, Title } from "../../../elements";

const text = {
  title: "슬롯 안에서 흐르는 요소",
  body: "at을 주지 않은 요소는 본문 슬롯 안에서 세로로 쌓입니다.",
  chips: ["/resume", "claude agents"],
};

export default function LayoutFlow() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.body} />
      <ClaudeChip value={text.chips[0]} />
      <TerminalChip value={text.chips[1]} />
    </Slide>
  );
}
