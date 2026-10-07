import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "마스터와 layout",
  subtitle: "layout 4개와 자유 배치 요소",
};

export default function LayoutTitle() {
  return (
    <Slide layout="title">
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
