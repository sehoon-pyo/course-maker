import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "조건문이란?",
  subtitle: "조건에 따라 실행할 코드를 고른다",
};

export default function ConditionTitle() {
  return (
    <Slide layout="title">
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
