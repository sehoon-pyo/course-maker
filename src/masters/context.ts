import { createContext, useContext } from "react";
import type { Master } from "./types";

/** 지금 그리는 슬라이드에 적용되는 마스터. `MasterFrame`이 내려 준다. */
export const MasterContext = createContext<Master | null>(null);

export function useMaster(): Master {
  const master = useContext(MasterContext);
  if (!master) {
    throw new Error("[masters] 마스터 밖에서 Slide를 그릴 수 없습니다. 슬라이드는 MasterFrame 안에서 그려야 합니다.");
  }
  return master;
}
