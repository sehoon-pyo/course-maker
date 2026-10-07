import { Bullets, Slide, Title } from "@/elements";

const text = {
  title: "숨김 슬라이드",
  items: [
    "section meta.ts의 slides에서 { id, hidden: true }로 숨긴다",
    "미리보기에서는 보이고 사이드바에 숨김으로 표시된다",
    "내보낼 때는 이 슬라이드가 빠진다",
  ],
};

export default function LayoutHidden() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
    </Slide>
  );
}
