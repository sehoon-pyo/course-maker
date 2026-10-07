import { Shape, Slide, Stamp, Text, Title } from "../../../elements";

const text = {
  title: "글과 도형을 at으로 배치",
  plain: "at으로 위치를 정한 글",
  filled: "바탕과 세로 가운데",
  dashed: "점선 테두리",
  round: "roundRect",
  stamp: "완료",
  shadow: "그림자",
};

export default function ElementsShapes() {
  return (
    <Slide layout="title-only">
      <Title value={text.title} />
      <Text at={{ x: 100, y: 230, w: 760 }} size={40} value={text.plain} />
      <Text at={{ x: 100, y: 320, w: 760, h: 90 }} fill="surface" anchor="middle" align="center" size={36} value={text.filled} />
      <Shape kind="rect" at={{ x: 100, y: 450, w: 300, h: 140 }} fill="surface" line={{ color: "primary", width: 3, dash: "dash" }} text={text.dashed} textStyle={{ size: 32 }} />
      <Shape kind="roundRect" at={{ x: 440, y: 450, w: 300, h: 140 }} fill="primary" text={text.round} textStyle={{ color: "#ffffff", size: 32, bold: true }} />
      <Shape kind="ellipse" at={{ x: 100, y: 640, w: 80, h: 80 }} fill="#FF0000" text="1" textStyle={{ color: "#ffffff", size: 36, bold: true }} />
      <Shape kind="rightArrow" at={{ x: 220, y: 640, w: 240, h: 100 }} fill="#FFC000" />
      <Shape kind="triangle" at={{ x: 500, y: 640, w: 120, h: 100 }} fill="primary-dark" />
      <Shape kind="line" at={{ x: 660, y: 690, w: 200, h: 0 }} line={{ color: "#222222", width: 4 }} />
      <Stamp at={{ x: 1000, y: 300 }} value={text.stamp} />
      <Shape kind="rect" at={{ x: 1000, y: 520, w: 360, h: 200 }} fill="#ffffff" line={{ color: "surface", width: 2 }} shadow={{ dx: 12, dy: 12, blur: 30, color: "rgba(0, 0, 0, 0.3)" }} text={text.shadow} textStyle={{ size: 36 }} />
      <Shape
        kind="path"
        path="M50 5 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z"
        viewBox={{ w: 100, h: 100 }}
        at={{ x: 1450, y: 300, w: 200, h: 200 }}
        fill="#FFC000"
        line={{ color: "#222222", width: 3 }}
      />
    </Slide>
  );
}
