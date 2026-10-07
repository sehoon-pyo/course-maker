import { Bullets, Slide, Title, badge, code, t } from "@/elements";

const text = {
  title: "함수 호출",
  items: [
    t`이름 뒤에 괄호를 붙여 호출한다: ${code("add(1, 2)")}`,
    t`괄호 안의 값을 ${badge("인자", "blue")}라고 한다`,
    t`돌려받은 값은 변수에 담을 수 있다: ${code("x = add(1, 2)")}`,
  ],
};

export default function FunctionCall() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
