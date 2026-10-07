import { Bullets, Slide, Title, badge, code } from "@/elements";

const text = {
  title: "if 문",
  items: [
    [code("if"), "로 조건을 검사한다"],
    [code("elif"), "로 다른 조건을 추가한다"],
    [code("else"), "는 나머지 경우를 처리한다"],
    [badge("주의", "red"), " 들여쓰기가 곧 문법이다"],
  ],
};

export default function ConditionIf() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
