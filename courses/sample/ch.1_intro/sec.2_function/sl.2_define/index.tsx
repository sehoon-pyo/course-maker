import { Bullets, Slide, Title, bold, code } from "@/elements";

const text = {
  title: "함수 정의",
  items: [
    ["키워드 ", code("def"), "로 시작한다"],
    ["값을 돌려줄 때는 ", code("return"), "을 쓴다"],
    ["이름은 ", bold("동사"), "로 짓는 것이 읽기 좋다"],
  ],
};

export default function FunctionDefine() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
