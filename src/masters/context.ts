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

/** 지금 그리는 슬라이드가 속한 chapter의 정보. 목차 요소가 읽는다. */
export interface ChapterInfo {
  /** section을 부르는 이름(예: SECTION, UNIT) */
  sectionLabel: string;
  /** chapter의 section 목록(순서대로) */
  sections: { id: string; title: string }[];
}

export const ChapterContext = createContext<ChapterInfo | null>(null);

export function useChapter(): ChapterInfo {
  const chapter = useContext(ChapterContext);
  if (!chapter) throw new Error("[masters] chapter 정보가 없습니다. MasterFrame에 chapter를 넘겨야 목차를 채울 수 있습니다.");
  return chapter;
}
