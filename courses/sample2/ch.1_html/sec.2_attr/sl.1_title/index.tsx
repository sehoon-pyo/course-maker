import { Paragraph, Slide, Title } from "@/elements";

const text = {
  title: "HTML 속성",
  subtitle: "태그에 추가 정보를 붙인다",
};

export default function AttrTitle() {
  return (
    <Slide>
      <Title value={text.title} />
      <Paragraph value={text.subtitle} />
    </Slide>
  );
}
