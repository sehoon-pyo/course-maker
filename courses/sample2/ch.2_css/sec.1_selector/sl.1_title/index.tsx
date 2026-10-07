import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "CSS 선택자",
  subtitle: "스타일을 적용할 요소를 고른다",
};

export default function SelectorTitle() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
