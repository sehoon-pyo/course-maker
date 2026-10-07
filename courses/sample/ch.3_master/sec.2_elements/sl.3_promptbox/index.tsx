import { Image, PromptBox, Slide, Title } from "@/elements";
import spark from "../../../assets/icon-spark.svg";
import sample from "../../../assets/sample.svg";

const text = {
  title: "PromptBox와 Image",
  small: "1000줄 소설 작성해",
  large: "새로운 워크트리를 만들어서 timeline.py에 jump_forward 함수를 구현하고 커밋해 줘",
  plain: "아이콘이 없으면 머리와 구분선이 없다",
};

export default function ElementsPromptBox() {
  return (
    <Slide layout="title-only">
      <Title value={text.title} />
      <PromptBox at={{ x: 120, y: 260, w: 399, h: 171 }} icon={spark} value={text.small} />
      <PromptBox at={{ x: 600, y: 260, w: 559, h: 281 }} icon={spark} value={text.large} />
      <PromptBox at={{ x: 120, y: 480, w: 399, h: 171 }} value={text.plain} />
      <Image at={{ x: 1250, y: 260, w: 560, h: 340 }} src={sample} alt="예시 이미지" />
      <Image at={{ x: 1250, y: 640, w: 300, h: 300 }} fit="cover" src={sample} alt="잘라 맞춘 예시 이미지" />
    </Slide>
  );
}
