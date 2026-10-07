import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "함수란?",
  subtitle: "코드를 묶어 이름을 붙인 것",
};

export default function FunctionTitle() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
