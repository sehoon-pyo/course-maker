import type {
  Layer,
  LayerRemoval,
  Layout,
  LayoutDef,
  Master,
  MasterDef,
  MasterSource,
  Rect,
  Slot,
} from "./types";

/**
 * 모든 마스터가 정해야 하는 CSS 변수. 도구의 기본 요소(제목, 문단, 불릿, 인라인 서식)와 슬롯이 읽는다.
 * 빠지면 값이 조용히 비어 버리므로 마스터를 읽을 때 오류로 알린다.
 * `--chip-*`, `--promptbox-*`는 해당 요소를 쓸 때만 필요해서 여기에 넣지 않는다.
 */
export const REQUIRED_TOKENS = [
  "--color-text",
  "--color-primary",
  "--color-code-bg",
  "--badge-green",
  "--badge-red",
  "--badge-blue",
  "--badge-gray",
  "--size-title",
  "--size-body",
  "--slot-gap",
] as const;

/** 마스터 파일의 `export default defineMaster({...})`. 타입 검사를 받기 위한 것이며 검증은 `buildMaster`가 한다. */
export function defineMaster(def: MasterDef): MasterDef {
  return def;
}

export class MasterError extends Error {
  readonly masterId: string;
  readonly problems: string[];

  constructor(masterId: string, problems: string[]) {
    super(`[masters] 마스터 "${masterId}"가 올바르지 않습니다.\n- ${problems.join("\n- ")}`);
    this.name = "MasterError";
    this.masterId = masterId;
    this.problems = problems;
  }
}

const isRemoval = (layer: Layer | LayerRemoval): layer is LayerRemoval => "remove" in layer;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function checkRect(r: Rect, where: string, problems: string[]) {
  if (!isNum(r.x) || !isNum(r.y)) problems.push(`${where}: x, y는 숫자여야 합니다.`);
  if (!isNum(r.w) || !isNum(r.h) || r.w <= 0 || r.h <= 0) problems.push(`${where}: w, h는 0보다 큰 숫자여야 합니다.`);
}

function checkIds(items: { id: string }[], what: string, where: string, problems: string[]) {
  const seen = new Set<string>();
  for (const { id } of items) {
    if (!id) problems.push(`${where}: id가 빈 ${what}이 있습니다.`);
    else if (seen.has(id)) problems.push(`${where}: ${what} id "${id}"가 중복됩니다.`);
    seen.add(id);
  }
}

function checkLayer(layer: Layer, where: string, problems: string[]) {
  const at = `${where} "${layer.id}"`;
  switch (layer.type) {
    case "color":
      if (!layer.value) problems.push(`${at}: color 층의 value가 비어 있습니다.`);
      break;
    case "image":
      checkRect(layer, at, problems);
      if (!layer.src) problems.push(`${at}: image 층의 src가 비어 있습니다.`);
      break;
    case "shape":
      checkRect(layer, at, problems);
      if (!layer.path) problems.push(`${at}: shape 층의 path가 비어 있습니다.`);
      if (!(layer.viewBox?.w > 0) || !(layer.viewBox?.h > 0)) problems.push(`${at}: shape 층의 viewBox는 0보다 커야 합니다.`);
      if (!layer.fill) problems.push(`${at}: shape 층의 fill이 비어 있습니다.`);
      break;
    case "text":
      checkRect(layer, at, problems);
      if (layer.size !== undefined && !(layer.size > 0)) problems.push(`${at}: text 층의 size는 0보다 커야 합니다.`);
      break;
    default:
      problems.push(`${at}: 알 수 없는 층 종류입니다(${String((layer as { type?: unknown }).type)}).`);
  }
}

function checkSlot(slot: Slot, where: string, problems: string[]) {
  const at = `${where} "${slot.id}"`;
  checkRect(slot, at, problems);
  if (slot.type === "list") {
    if (!Number.isInteger(slot.rows) || slot.rows < 1) problems.push(`${at}: list 슬롯의 rows는 1 이상의 정수여야 합니다.`);
    if (!(slot.pitch > 0)) problems.push(`${at}: list 슬롯의 pitch는 0보다 커야 합니다.`);
    if (!slot.columns?.length) problems.push(`${at}: list 슬롯에는 columns가 하나 이상 있어야 합니다.`);
    for (const [i, c] of (slot.columns ?? []).entries()) {
      if (!isNum(c.x) || !(c.w > 0)) problems.push(`${at}: columns[${i}]의 x는 숫자, w는 0보다 커야 합니다.`);
    }
  } else if (!["title", "subtitle", "body", "free"].includes(slot.type)) {
    problems.push(`${at}: 알 수 없는 슬롯 종류입니다(${String((slot as { type?: unknown }).type)}).`);
  }
}

/**
 * layout의 background를 master의 층에 적용한다.
 * - 같은 id는 그 자리에서 대체한다(순서는 master의 것).
 * - master에 없는 id는 새 층이며 맨 위에 선언 순서대로 쌓는다.
 * - `{ id, remove: true }`는 master의 층을 뺀다.
 */
export function applyBackground(base: Layer[], overrides: (Layer | LayerRemoval)[] | undefined): Layer[] {
  if (!overrides) return base;
  const result = [...base];
  for (const o of overrides) {
    const index = result.findIndex((l) => l.id === o.id);
    if (isRemoval(o)) {
      if (index >= 0) result.splice(index, 1);
    } else if (index >= 0) {
      result[index] = o;
    } else {
      result.push(o);
    }
  }
  return result;
}

function buildLayout(id: string, def: LayoutDef, base: Layer[], problems: string[]): Layout {
  const where = `layout "${id}"`;
  const decorations = def.decorations ?? [];
  const slots = def.slots ?? [];

  checkIds(decorations, "장식", where, problems);
  for (const d of decorations) checkLayer(d, `${where}의 장식`, problems);
  checkIds(slots, "슬롯", where, problems);
  for (const s of slots) checkSlot(s, `${where}의 슬롯`, problems);

  const overrides = def.background;
  if (overrides) {
    checkIds(overrides, "background 층", where, problems);
    const baseIds = new Set(base.map((l) => l.id));
    for (const o of overrides) {
      if (isRemoval(o)) {
        if (!baseIds.has(o.id)) problems.push(`${where}: master에 없는 층 "${o.id}"를 remove할 수 없습니다.`);
      } else {
        checkLayer(o, `${where}의 background`, problems);
      }
    }
  }

  return { id, background: applyBackground(base, overrides), decorations, slots };
}

/** 마스터 정의를 검증하고 layout의 background 상속을 풀어 `Master`로 만든다. 문제가 있으면 모두 모아 `MasterError`로 던진다. */
export function buildMaster(id: string, source: MasterSource, def: MasterDef): Master {
  const problems: string[] = [];
  const background = def.background ?? [];

  for (const key of Object.keys(def.tokens ?? {})) {
    if (!key.startsWith("--")) problems.push(`tokens: 키 "${key}"는 "--"로 시작해야 합니다.`);
  }
  const missing = REQUIRED_TOKENS.filter((key) => !(key in (def.tokens ?? {})));
  if (missing.length > 0) problems.push(`tokens: 슬라이드의 기본 요소가 읽는 토큰이 없습니다: ${missing.join(", ")}`);

  checkIds(background, "background 층", "master", problems);
  for (const l of background) checkLayer(l, "master의 background", problems);

  const layoutIds = Object.keys(def.layouts ?? {});
  if (layoutIds.length === 0) problems.push("layout이 하나도 없습니다.");

  const layouts: Record<string, Layout> = {};
  for (const layoutId of layoutIds) {
    layouts[layoutId] = buildLayout(layoutId, def.layouts[layoutId], background, problems);
  }

  for (const [name, src] of Object.entries(def.icons ?? {})) {
    if (!/^[\w-]+$/.test(name)) problems.push(`icons: 이름 "${name}"은 영문, 숫자, _, -만 쓸 수 있습니다.`);
    if (typeof src !== "string" || !src) problems.push(`icons: "${name}"의 이미지 주소가 비어 있습니다.`);
  }

  if (problems.length > 0) throw new MasterError(id, problems);
  return { id, source, tokens: def.tokens ?? {}, icons: def.icons ?? {}, background, layouts };
}
