import { Bullets, Slide, Title, badge, code, t } from "@/elements";

const text = {
  title: "while 문",
  items: [
    t`${code("while")}은 조건이 참인 동안 반복한다`,
    t`조건이 바뀌지 않으면 ${badge("무한 반복", "red")}에 빠진다`,
    t`${badge("팁", "green")} 횟수를 모를 때 ${code("while")}을 쓴다`,
  ],
};

export default function LoopWhile() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
