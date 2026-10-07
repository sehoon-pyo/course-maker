import { defineMaster } from "@/masters/define";

/**
 * 임시 default 마스터(2단계용). 지금의 슬라이드 모양(흰 배경, 위에서 아래로 제목과 본문)을 그대로 슬롯으로 옮긴 것이다.
 * 3단계에서 기존 PPTX의 값(layout 4개, 장식, 로고)으로 바꾼다.
 */
export default defineMaster({
  tokens: {
    "--color-text": "#222222",
    "--color-primary": "#1f4e79",
    "--color-muted": "#6b7280",
    "--color-code-bg": "#f1f5f9",
    "--badge-green": "#2e7d32",
    "--badge-red": "#c62828",
    "--badge-blue": "#1565c0",
    "--badge-gray": "#546e7a",
    "--size-title": "76px",
    "--size-body": "44px",
    "--slot-gap": "32px",
  },
  background: [{ id: "base", type: "color", value: "#ffffff" }],
  layouts: {
    content: {
      slots: [
        { id: "title", type: "title", x: 96, y: 96, w: 1728, h: 95 },
        { id: "body", type: "body", x: 96, y: 239, w: 1728, h: 745 },
      ],
    },
  },
});
