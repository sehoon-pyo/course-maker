import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "변수란?",
  subtitle: "값을 담는 이름표",
};

export default function VariableTitle() {
  return (
    <Slide layout="title">
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
