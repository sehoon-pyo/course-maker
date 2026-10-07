import { defineMaster } from "@/masters/define";
import type { Layer, TextSlot } from "@/masters/types";
import logo from "./assets/logo.svg";

/**
 * default 마스터. 기존 PPTX(2_Agent_View_기반_병렬_개발_r8.pptx)의 마스터와 layout 4개를 1920x1080px로 옮긴 것이다.
 * 좌표는 PPTX의 EMU를 6350으로 나눈 값(1px = 0.5pt)이다. 도형 경로는 PPTX의 자유형 값 그대로이다.
 * 디자인 값(색, 크기, 간격)은 tokens가 정하고, 층과 슬롯은 토큰 이름(primary 등)으로 가져다 쓴다.
 */

/** 대제목 layout의 장식에 있는 바깥 그림자 (blurRad 80px, 거리 36px, 방향 45°, 검정 23%) */
const shadow = { dx: 25.5, dy: 25.5, blur: 80, color: "rgba(0, 0, 0, 0.23)" };

/** 컨텐츠 계열 layout이 공유하는 위쪽 띠와 삼각 탭 */
const band: Layer[] = [
  { id: "band", type: "shape", x: 0, y: 0, w: 1920, h: 116, viewBox: { w: 1920, h: 116 }, path: "M0 0 H1920 V116 H0 Z", fill: "primary" },
  // 90° 회전된 이등변삼각형. 왼쪽 가장자리에 밑변이 있고 오른쪽을 향한다.
  { id: "tab", type: "shape", x: 0, y: 64, w: 58, h: 106, viewBox: { w: 58, h: 106 }, path: "M0 0 L58 53 L0 106 Z", fill: "primary" },
];

const contentTitle: TextSlot = { id: "title", type: "title", x: 58, y: 28, w: 1656, h: 73, size: 48, color: "#ffffff", anchor: "middle" };

export default defineMaster({
  tokens: {
    "--color-text": "#222222",
    "--color-primary": "#164194",
    "--color-primary-dark": "#204273",
    "--color-surface": "#E7E6E6",
    "--color-muted": "#6b7280",
    "--color-code-bg": "#f1f5f9",
    "--badge-green": "#2e7d32",
    "--badge-red": "#c62828",
    "--badge-blue": "#1565c0",
    "--badge-gray": "#546e7a",
    "--size-title": "88px",
    "--size-body": "48px",
    "--slot-gap": "32px",
    // Chip: 둥근 사각형(채움 흰색 95%, 흰 테두리 3px)에 아이콘과 글자
    "--chip-height": "74px",
    "--chip-bg": "#F2F2F2",
    "--chip-border": "#ffffff",
    "--chip-border-width": "3px",
    "--chip-radius": "12px",
    "--chip-font-size": "36px",
    "--chip-icon-size": "56px",
    "--chip-pad-left": "13px",
    "--chip-pad-right": "28px",
    "--chip-gap": "12px",
    // PromptBox: 어두운 상자, 주황 테두리, 위쪽 아이콘과 흰 구분선, 노란 글자
    "--promptbox-bg": "#0C0C0C",
    "--promptbox-border": "#D77757",
    "--promptbox-border-width": "3px",
    "--promptbox-radius": "5px",
    "--promptbox-text": "#FFC000",
    "--promptbox-font-size": "36px",
    "--promptbox-head": "74px",
    "--promptbox-icon-height": "43px",
    "--promptbox-line": "#ffffff",
    "--promptbox-line-width": "3px",
    "--promptbox-line-inset": "35px",
    "--promptbox-pad-x": "30px",
    "--promptbox-pad-y": "2px",
  },

  background: [{ id: "base", type: "color", value: "#ffffff" }],

  layouts: {
    /** 대제목 */
    title: {
      decorations: [
        // 왼쪽 위의 둥근 V자 모양 (흰색 95%)
        {
          id: "corner-top-left",
          type: "shape",
          x: -44,
          y: -50.3,
          w: 666,
          h: 236,
          viewBox: { w: 3751803, h: 2148102 },
          path: "M0 0 L3751803 0 L3751803 728641 C3751803 1013009 3600096 1275772 3353832 1417951 L2273872 2041470 C2027608 2183647 1724194 2183647 1477929 2041470 L397972 1417951 C151706 1275772 0 1013009 0 728641 Z",
          fill: "#F2F2F2",
          shadow,
        },
        // 오른쪽 아래의 산 모양
        {
          id: "corner-bottom-right",
          type: "shape",
          x: 1278,
          y: 884,
          w: 746,
          h: 196,
          viewBox: { w: 3743599, h: 1357681 },
          path: "M1871799 0 C2009219 0 2146638 35546 2269770 106637 L3349730 730149 C3565211 854558 3708297 1071288 3740702 1314031 L3743599 1357681 L0 1357681 L2898 1314031 C35302 1071288 178388 854558 393870 730149 L1473827 106637 C1596960 35546 1734380 0 1871799 0 Z",
          fill: "primary-dark",
          shadow,
        },
        { id: "logo", type: "image", src: logo, x: 1587, y: 52, w: 254, h: 58 },
      ],
      slots: [
        { id: "title", type: "title", x: 0, y: 385, w: 1920, h: 209, size: 132, color: "primary", align: "center", anchor: "middle" },
        // PPTX에는 없는 슬롯. 샘플의 대제목 슬라이드가 부제(Paragraph)를 쓰기 때문에 제목 아래에 둔다.
        { id: "subtitle", type: "subtitle", x: 0, y: 610, w: 1920, h: 80, size: 40, color: "muted", align: "center", anchor: "top" },
      ],
    },

    /** 컨텐츠 (제목 및 내용) */
    content: {
      decorations: band,
      slots: [contentTitle, { id: "body", type: "body", x: 53, y: 206, w: 1815, h: 770, size: 48 }],
    },

    /** 제목만 있는 컨텐츠. 본문은 슬라이드가 자유롭게 배치한다. */
    "title-only": {
      decorations: band,
      slots: [contentTitle, { id: "free", type: "free", x: 53, y: 206, w: 1815, h: 770, size: 48 }],
    },

    /** 목차. 항목은 chapter의 section 목록으로 자동 채운다(4단계). */
    toc: {
      decorations: [
        { id: "panel", type: "shape", x: 0, y: 0, w: 364, h: 1080, viewBox: { w: 364, h: 1080 }, path: "M0 0 H364 V1080 H0 Z", fill: "rgba(231, 230, 230, 0.29)" },
        { id: "strip", type: "shape", x: 0, y: 0, w: 1071.5, h: 50.5, viewBox: { w: 1071.5, h: 50.5 }, path: "M0 0 H1071.5 V50.5 H0 Z", fill: "rgba(231, 230, 230, 0.05)" },
        { id: "label-en", type: "text", value: "CONTENTS", x: 89.4, y: 145.4, w: 177, h: 82.3, size: 32, color: "text", align: "center", anchor: "middle" },
        { id: "label-ko", type: "text", value: "목차", x: 89.4, y: 224.8, w: 177, h: 82.3, size: 80, bold: true, color: "text", align: "center", anchor: "middle" },
      ],
      slots: [
        {
          id: "items",
          type: "list",
          x: 364,
          y: 173,
          w: 1378,
          h: 50,
          rows: 10,
          pitch: 76,
          columns: [
            // 번호 칸: 주색 바탕에 흰 글자
            { x: 364, w: 228, size: 28, color: "#ffffff", align: "center", anchor: "middle", fill: "primary" },
            // 제목 칸
            { x: 614, w: 1128, size: 36, bold: true, color: "text", align: "left", anchor: "middle" },
          ],
        },
      ],
    },
  },
});
