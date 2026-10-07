import { Bullets, Slide, Title, badge } from "@/elements";

const text = {
  title: "기본 자료형",
  items: [
    [badge("정수", "blue"), " 10, -3, 0"],
    [badge("실수", "blue"), " 3.14, -0.5"],
    [badge("문자열", "red"), " \"안녕\", 'hello'"],
    [badge("불리언", "gray"), " True, False"],
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
