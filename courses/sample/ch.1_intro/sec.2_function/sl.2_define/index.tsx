import { Bullets, Slide, Title, bold, code, t } from "@/elements";

const text = {
  title: "함수 정의",
  items: [
    t`키워드 ${code("def")}로 시작한다`,
    t`값을 돌려줄 때는 ${code("return")}을 쓴다`,
    t`이름은 ${bold("동사")}로 짓는 것이 읽기 좋다`,
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
