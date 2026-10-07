import { Bullets, Slide, Title, bold, code } from "@/elements";

const text = {
  title: "선택자의 종류",
  items: [
    [bold("태그 선택자"), ": ", code("p"), " 모든 문단"],
    [bold("클래스 선택자"), ": ", code(".box"), " 클래스가 box인 요소"],
    [bold("아이디 선택자"), ": ", code("#main"), " 아이디가 main인 요소"],
  ],
};

export default function SelectorKinds() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
