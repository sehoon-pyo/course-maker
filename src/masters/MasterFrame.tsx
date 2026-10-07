import type { CSSProperties, ReactNode } from "react";
import { ChapterContext, MasterContext, type ChapterInfo } from "./context";
import type { Master } from "./types";

/**
 * 슬라이드 크기의 컨테이너(`.slide`). 마스터와 chapter 정보를 context로 내려 주고, 마스터의 토큰을 CSS 변수로 준다.
 * 미리보기와 export가 같은 `MasterFrame`으로 슬라이드를 그린다.
 */
export function MasterFrame({ master, chapter, children }: { master: Master; chapter?: ChapterInfo; children: ReactNode }) {
  return (
    <MasterContext.Provider value={master}>
      <ChapterContext.Provider value={chapter ?? null}>
        <div className="slide" data-master={master.id} style={master.tokens as CSSProperties}>
          {children}
        </div>
      </ChapterContext.Provider>
    </MasterContext.Provider>
  );
}
