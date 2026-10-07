import { Bullets, Slide, Title, badge, code, t } from "@/elements";

const text = {
  title: "id와 class",
  items: [
    t`${code("id")}는 문서 안에서 ${badge("하나만", "red")} 쓸 수 있는 이름이다`,
    t`${code("class")}는 여러 요소에 ${badge("반복", "green")}해서 쓸 수 있다`,
    "CSS와 JavaScript는 이 이름으로 요소를 찾는다",
  ],
};

export default function AttrClass() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
