import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/constants";

const MARGIN = 24;

/**
 * 슬라이드 미리보기 영역(slide-preview-area).
 * 1920x1080 고정 크기의 슬라이드를 영역 크기에 맞춰 비율 유지로 축소해서 보여 준다. (슬라이드 자체가 아니라 슬라이드를 보여 주는 영역)
 */
export function SlidePreviewArea({ children }: { children: ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const area = areaRef.current!;
    const fit = () => {
      const w = area.clientWidth - MARGIN * 2;
      const h = area.clientHeight - MARGIN * 2;
      setScale(Math.max(0.05, Math.min(w / SLIDE_WIDTH, h / SLIDE_HEIGHT)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="slide-preview-area" ref={areaRef}>
      <div
        className="slide-preview-area-frame"
        style={{ width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale }}
      >
        <div
          className="slide-preview-area-slide"
          style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
