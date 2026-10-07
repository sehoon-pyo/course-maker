import type { CSSProperties } from "react";
import { resolveColor } from "./color";
import type { Layer, Rect, TextStyle } from "./types";

const box = ({ x, y, w, h }: Rect): CSSProperties => ({ position: "absolute", left: x, top: y, width: w, height: h });

export const ANCHOR = { top: "flex-start", middle: "center", bottom: "flex-end" } as const;
const ALIGN = { left: "flex-start", center: "center", right: "flex-end" } as const;

/** 슬롯과 text 층이 함께 쓰는 글자 속성. 지정하지 않은 값은 CSS가 상속한다. */
export function textStyle(s: TextStyle, tokens: Record<string, string>): CSSProperties {
  return {
    fontSize: s.size,
    color: resolveColor(s.color, tokens),
    textAlign: s.align,
    fontWeight: s.bold === undefined ? undefined : s.bold ? 700 : 400,
  };
}

function LayerNode({ layer, tokens, z }: { layer: Layer; tokens: Record<string, string>; z: number }) {
  switch (layer.type) {
    case "color":
      return <div className="layer" style={{ position: "absolute", inset: 0, zIndex: z, background: resolveColor(layer.value, tokens) }} />;
    case "image":
      return <img className="layer" src={layer.src} alt="" draggable={false} style={{ ...box(layer), zIndex: z }} />;
    case "shape": {
      const s = layer.shadow;
      return (
        <svg
          className="layer"
          viewBox={`0 0 ${layer.viewBox.w} ${layer.viewBox.h}`}
          preserveAspectRatio="none"
          style={{
            ...box(layer),
            zIndex: z,
            overflow: "visible",
            filter: s ? `drop-shadow(${s.dx}px ${s.dy}px ${s.blur / 2}px ${resolveColor(s.color, tokens)})` : undefined,
          }}
        >
          <path d={layer.path} fill={resolveColor(layer.fill, tokens)} />
        </svg>
      );
    }
    case "text":
      return (
        <div
          className="layer"
          style={{
            ...box(layer),
            ...textStyle(layer, tokens),
            zIndex: z,
            display: "flex",
            alignItems: ANCHOR[layer.anchor ?? "middle"],
            justifyContent: ALIGN[layer.align ?? "left"],
          }}
        >
          {layer.value}
        </div>
      );
  }
}

/** 층 배열을 아래에서 위로 그린다. 쌓는 순서는 배열 순서이며 `z-index`는 여기서 `(순번 + 1) × 100`으로 만든다. */
export function Layers({ layers, tokens }: { layers: Layer[]; tokens: Record<string, string> }) {
  return (
    <>
      {layers.map((layer, i) => (
        <LayerNode key={layer.id} layer={layer} tokens={tokens} z={(i + 1) * 100} />
      ))}
    </>
  );
}
