import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "HTML 태그",
  subtitle: "문서의 구조와 의미를 표시하는 표지",
};

export default function TagTitle() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
