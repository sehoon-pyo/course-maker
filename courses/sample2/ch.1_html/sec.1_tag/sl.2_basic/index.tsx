import { Bullets, CodeChip, Slide, Title, badge, bold, code, t } from "../../../elements";

const text = {
  title: "기본 태그",
  items: [
    t`${code("<h1>")}은 ${bold("제목")}을 나타낸다`,
    t`${code("<p>")}는 문단을 나타낸다`,
    t`${code("<a>")}는 다른 문서로 가는 링크를 만든다`,
    t`${badge("참고", "blue")} 대부분의 태그는 여는 태그와 닫는 태그가 짝을 이룬다`,
  ],
  chip: "<html>",
  placed: "<body>",
};

export default function TagBasic() {
  return (
    <Slide>
      <Title value={text.title} />
      <Bullets items={text.items} />
      <CodeChip value={text.chip} />
      <CodeChip at={{ x: 1300, y: 760 }} value={text.placed} />
    </Slide>
  );
}
