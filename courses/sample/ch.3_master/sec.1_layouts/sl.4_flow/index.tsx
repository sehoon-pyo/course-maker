import { Chip, Paragraph, Slide, Title } from "@/elements";
import terminal from "../../../assets/icon-terminal.svg";

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
      <Chip value={text.chips[0]} />
      <Chip value={text.chips[1]} icon={terminal} />
    </Slide>
  );
}
