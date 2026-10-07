import { Bullets, Slide, Title, badge, t } from "@/elements";

const text = {
  title: "컨텐츠 layout",
  items: [
    "제목 슬롯과 본문 슬롯이 있다",
    t`본문 슬롯의 요소는 ${badge("세로", "blue")}로 쌓인다`,
    "layout을 생략하면 이 layout으로 그려진다",
  ],
};

export default function LayoutContent() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
