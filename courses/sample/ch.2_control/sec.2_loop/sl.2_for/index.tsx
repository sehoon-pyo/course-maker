import { Bullets, Slide, Title, badge, bold, code, t } from "@/elements";

const text = {
  title: "for 문",
  items: [
    t`${code("for")}는 ${bold("순서가 있는 값")}을 하나씩 꺼낸다`,
    t`${code("range(5)")}는 0부터 4까지의 값을 만든다`,
    t`${badge("팁", "green")} 횟수가 정해져 있으면 ${code("for")}를 쓴다`,
  ],
};

export default function LoopFor() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
