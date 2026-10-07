import { Shape, Slide, Stamp, Title } from "../../elements";

/**
 * chapter의 tail 슬라이드 예시. 예시 PPT의 마지막 장("현재 우리는")을 따라 만든 진행 현황이다.
 * 아래 화살표를 배경으로 단계가 쌓이고, 끝난 단계는 어둡게 덮은 위에 "완료" 도장이 찍힌다.
 */
const text = {
  title: "현재 우리는",
  steps: ["마스터와 layout", "자유 배치 요소", "칩과 프롬프트 상자", "강의 전용 요소", "chapter의 head와 tail"],
  done: "완료",
};

const DONE = 2; // 앞의 두 단계는 끝났다
const STEP = { x: 665.7, w: 588.5, h: 93.3, top: 226.2, pitch: 153.6 };

export default function ProgressTail() {
  return (
    <Slide layout="title-only">
      <Title value={text.title} />
      {/* 배경의 아래 화살표 (몸통 폭 50%, 머리 길이 72px) */}
      <Shape
        kind="path"
        path="M74.25 0 H222.75 V812.4 H297 L148.5 884.4 L0 812.4 H74.25 Z"
        viewBox={{ w: 297, h: 884.4 }}
        at={{ x: 811.5, y: 168, w: 297, h: 884.4 }}
        fill="#FFC000"
      />
      {text.steps.map((step, i) => (
        <Shape
          key={step}
          kind="rect"
          at={{ x: STEP.x, y: STEP.top + i * STEP.pitch, w: STEP.w, h: STEP.h }}
          fill="primary"
          text={step}
          textStyle={{ color: "#ffffff", size: 36 }}
        />
      ))}
      {/* 끝난 단계를 어둡게 덮는다 */}
      {text.steps.slice(0, DONE).map((step, i) => (
        <Shape key={`dim-${step}`} kind="rect" at={{ x: STEP.x, y: STEP.top + i * STEP.pitch, w: STEP.w, h: STEP.h }} fill="rgba(0, 0, 0, 0.29)" />
      ))}
      {text.steps.slice(0, DONE).map((step, i) => (
        <Stamp key={`stamp-${step}`} at={{ x: 1194.2, y: STEP.top + 6.9 + i * STEP.pitch }} value={text.done} />
      ))}
    </Slide>
  );
}
