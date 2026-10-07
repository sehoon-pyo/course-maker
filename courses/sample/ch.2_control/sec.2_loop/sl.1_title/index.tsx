import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "반복문이란?",
  subtitle: "같은 일을 여러 번 반복한다",
};

export default function LoopTitle() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
