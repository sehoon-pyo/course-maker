import type { CSSProperties, ReactNode } from "react";
import { MasterContext } from "./context";
import type { Master } from "./types";

/**
 * 슬라이드 크기의 컨테이너(`.slide`). 마스터를 context로 내려 주고, 마스터의 토큰을 CSS 변수로 준다.
 * 미리보기와 export가 같은 `MasterFrame`으로 슬라이드를 그린다.
 */
export function MasterFrame({ master, children }: { master: Master; children: ReactNode }) {
  return (
    <MasterContext.Provider value={master}>
      <div className="slide" data-master={master.id} style={master.tokens as CSSProperties}>
        {children}
      </div>
    </MasterContext.Provider>
  );
}
