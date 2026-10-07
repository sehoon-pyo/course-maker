import { Bullets, Slide, Title, badge, bold, code } from "@/elements";

const text = {
  title: "변수의 정의",
  items: [
    "값을 담는 이름표",
    ["타입은 ", badge("동적", "green"), "으로 결정된다"],
    ["대입은 ", code("x = 10"), " 처럼 ", bold("등호"), "를 쓴다"],
  ],
};

export default function VariableDefinition() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
