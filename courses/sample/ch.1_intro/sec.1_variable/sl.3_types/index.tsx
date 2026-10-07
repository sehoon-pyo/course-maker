import { Bullets, Slide, Title, badge, t } from "@/elements";

const text = {
  title: "기본 자료형",
  items: [
    t`${badge("정수", "blue")} 10, -3, 0`,
    t`${badge("실수", "blue")} 3.14, -0.5`,
    t`${badge("문자열", "red")} "안녕", 'hello'`,
    t`${badge("불리언", "gray")} True, False`,
  ],
};

export default function VariableTypes() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
