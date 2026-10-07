import { defineMaster } from "@/masters/define";

/**
 * sample2의 강의 전용 마스터. 도구의 default와 다른 모양(따뜻한 바탕, 갈색 제목, 가는 밑줄)으로
 * 강의 전용 마스터를 쓰면 `courses/{강의}/masters/{id}/`에서 읽힌다는 것을 보여 준다.
 * layout은 title, content 두 가지만 가진다.
 */
export default defineMaster({
  tokens: {
    "--color-text": "#3b2a1a",
    "--color-primary": "#7a3b00",
    "--color-muted": "#8a7a68",
    "--color-code-bg": "#f3e6d4",
    "--badge-green": "#2e7d32",
    "--badge-red": "#c62828",
    "--badge-blue": "#1565c0",
    "--badge-gray": "#546e7a",
    "--size-title": "72px",
    "--size-body": "44px",
    "--slot-gap": "28px",
    // Chip을 쓰는 강의는 모양도 정한다(도구는 값을 정하지 않는다)
    "--chip-height": "70px",
    "--chip-bg": "#f3e6d4",
    "--chip-border": "#7a3b00",
    "--chip-border-width": "2px",
    "--chip-radius": "35px",
    "--chip-font-size": "34px",
    "--chip-icon-size": "44px",
    "--chip-pad-left": "18px",
    "--chip-pad-right": "26px",
    "--chip-gap": "12px",
  },

  background: [{ id: "base", type: "color", value: "#fffaf0" }],

  layouts: {
    title: {
      // master의 background에서 같은 id(base)만 대체한다. 지정하지 않은 layout(content)은 master의 것을 그대로 쓴다.
      background: [{ id: "base", type: "color", value: "#f3e6d4" }],
      decorations: [{ id: "bar", type: "shape", x: 860, y: 330, w: 200, h: 8, viewBox: { w: 200, h: 8 }, path: "M0 0 H200 V8 H0 Z", fill: "primary" }],
      slots: [
        { id: "title", type: "title", x: 160, y: 380, w: 1600, h: 200, size: 112, align: "center", anchor: "middle" },
        { id: "subtitle", type: "subtitle", x: 160, y: 600, w: 1600, h: 80, size: 44, color: "muted", align: "center", anchor: "top" },
      ],
    },

    content: {
      decorations: [{ id: "underline", type: "shape", x: 96, y: 190, w: 1728, h: 6, viewBox: { w: 1728, h: 6 }, path: "M0 0 H1728 V6 H0 Z", fill: "primary" }],
      slots: [
        { id: "title", type: "title", x: 96, y: 64, w: 1728, h: 110, anchor: "middle" },
        { id: "body", type: "body", x: 96, y: 232, w: 1728, h: 760 },
      ],
    },
  },
});
