import { DEFAULT_MASTER_ID } from "@/constants";
import { buildMaster } from "./define";
import type { Master, MasterDef, MasterSource } from "./types";

/**
 * 마스터는 폴더 하나가 마스터 하나이고, 폴더 이름이 마스터 id이다.
 * - 도구 제공: src/masters/{id}/index.tsx
 * - 강의 전용: courses/{강의}/masters/{id}/index.tsx
 * `_`로 시작하는 폴더(`_shared` 등)는 공용 부품을 두는 곳이라 마스터로 등록하지 않는다.
 */
// `import: "default"`로 모으면 default export가 없는 파일 하나 때문에 전체가 읽히지 않으므로, 모듈 전체를 받아 `.default`를 직접 읽는다.
type MasterModule = { default?: MasterDef };
const toolModules = import.meta.glob<MasterModule>("/src/masters/*/index.tsx", { eager: true });
const courseModules = import.meta.glob<MasterModule>("/courses/*/masters/*/index.tsx", { eager: true });

interface Entry {
  id: string;
  path: string;
  def: MasterDef | undefined;
}

/** `/src/masters/{id}/index.tsx` → `{id}` */
const toolEntries = new Map<string, Entry>();
for (const [path, mod] of Object.entries(toolModules)) {
  const id = path.split("/")[3];
  if (!id.startsWith("_")) toolEntries.set(id, { id, path, def: mod.default });
}

/** `/courses/{강의}/masters/{id}/index.tsx` → 강의별 `{id}` */
const courseEntries = new Map<string, Map<string, Entry>>();
for (const [path, mod] of Object.entries(courseModules)) {
  const [, , course, , id] = path.split("/");
  if (id.startsWith("_")) continue;
  if (!courseEntries.has(course)) courseEntries.set(course, new Map());
  courseEntries.get(course)!.set(id, { id, path, def: mod.default });
}

const built = new Map<string, Master>();

/**
 * 강의가 쓰는 마스터를 찾는다. 조회 순서는 ① 강의 전용 → ② 도구 제공이고, 같은 id가 양쪽에 있으면 강의 전용이 우선한다.
 * 없으면 사용 가능한 마스터 목록과 함께 오류를 던진다.
 */
export function resolveMaster(courseId: string, masterId: string = DEFAULT_MASTER_ID): Master {
  const own = courseEntries.get(courseId)?.get(masterId);
  const source: MasterSource = own ? "course" : "tool";
  const entry = own ?? toolEntries.get(masterId);

  if (!entry) {
    const available = [
      ...[...(courseEntries.get(courseId)?.keys() ?? [])].map((id) => `${id}(강의 전용)`),
      ...[...toolEntries.keys()].map((id) => `${id}(도구 제공)`),
    ];
    throw new Error(
      `[masters] 마스터 "${masterId}"를 찾을 수 없습니다(강의: ${courseId}). 사용 가능한 마스터: ${available.join(", ") || "없음"}`,
    );
  }
  if (!entry.def) {
    throw new Error(`[masters] ${entry.path}에 default export가 없습니다. export default defineMaster({...}) 형태여야 합니다.`);
  }

  const key = `${source}:${entry.path}`;
  let master = built.get(key);
  if (!master) {
    master = buildMaster(entry.id, source, entry.def);
    built.set(key, master);
  }
  return master;
}
