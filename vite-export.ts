import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { EXPORT_ENDPOINT, EXPORT_FORMATS } from "./src/constants";
import { buildChapterHtml } from "./vite-export-html";

const pad = (n: number) => String(n).padStart(2, "0");

/** 연월일시분초 14자리(예: `20261010172130`). 서버의 현지 시각이다. */
const timestamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/** 파일 이름에 쓸 수 없는 문자(Windows 기준)를 `_`로 바꾼다. */
const safeName = (s: string) => s.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").replace(/[. ]+$/, "").trim() || "untitled";

/** `CHAPTER_<No>_<파일제목>`. No는 course의 chapter 순서이고 chapter 수의 자릿수에 맞춰 0으로 채운다. */
const chapterFileName = (index: number, total: number, title: string) =>
  `CHAPTER_${String(index + 1).padStart(String(total).length, "0")}_${safeName(title)}`;

/**
 * 개발 서버에서 내보내기를 처리한다: `courses/{강의}/export/{연월일시분초}/` 폴더를 만들고,
 * 고른 chapter를 고른 형식으로 저장한다. 지금은 HTML만 만들고, PPTX와 PDF는 아직 없다.
 * 브라우저는 로컬 폴더에 쓸 수 없고 슬라이드 TSX는 Vite가 변환해야 읽히므로 개발 서버가 대신 한다.
 */
export function exportFolder(): Plugin {
  return {
    name: "course-maker-export",
    apply: "serve",
    configureServer(server) {
      const root = resolve(server.config.root); // Windows에서 구분자를 맞춘다
      const coursesDir = resolve(root, "courses");

      server.middlewares.use(EXPORT_ENDPOINT, (req, res) => {
        const send = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(body));
        };
        if (req.method !== "POST") return send(405, { error: "POST만 받습니다." });
        // JSON만 받는다. 다른 사이트의 form 전송으로 폴더가 만들어지는 것을 막는다.
        if (!req.headers["content-type"]?.startsWith("application/json")) return send(415, { error: "JSON만 받습니다." });

        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", async () => {
          let course: unknown, chapters: unknown, formats: unknown;
          try {
            ({ course, chapters, formats } = JSON.parse(raw));
          } catch {
            return send(400, { error: "요청을 읽지 못했습니다." });
          }
          // 강의 id는 courses/ 바로 아래 폴더 이름이다. 경로를 벗어나는 값은 받지 않는다.
          if (typeof course !== "string" || !/^[\w.-]+$/.test(course) || course === "." || course === "..") {
            return send(400, { error: "강의 이름이 올바르지 않습니다." });
          }
          const courseDir = resolve(coursesDir, course);
          if (!existsSync(resolve(courseDir, "meta.ts"))) return send(404, { error: `강의를 찾을 수 없습니다: ${course}` });
          const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
          if (!isStrings(chapters) || !isStrings(formats) || !formats.every((f) => (EXPORT_FORMATS as readonly string[]).includes(f))) {
            return send(400, { error: "chapter와 파일 형식이 올바르지 않습니다." });
          }

          try {
            // 파일을 쓰기 전에 모두 만들어 둔다. 중간에 실패해도 빈 폴더나 일부 파일이 남지 않는다.
            const files = new Map<string, string>();
            if (formats.includes("HTML") && chapters.length > 0) {
              const { chaptersOf, renderChapter } = await server.ssrLoadModule("/src/export/renderChapter.tsx");
              const all: { id: string; title: string }[] | undefined = chaptersOf(course);
              if (!all) throw new Error(`강의를 읽지 못했습니다: ${course}`);
              const slideCss = readFileSync(resolve(root, "src/slide.css"), "utf8");
              for (const id of chapters) {
                const index = all.findIndex((c) => c.id === id);
                if (index < 0) return send(404, { error: `chapter를 찾을 수 없습니다: ${id}` });
                const html = buildChapterHtml({ title: all[index].title, slides: renderChapter(course, id), slideCss, root });
                files.set(`${chapterFileName(index, all.length, all[index].title)}.html`, html);
              }
            }

            const exportDir = resolve(courseDir, "export");
            const name = timestamp(new Date());
            const dir = resolve(exportDir, name);
            mkdirSync(exportDir, { recursive: true });
            try {
              mkdirSync(dir); // 같은 초에 두 번 실행하면 이미 있어 실패한다. 덮어쓰지 않는다.
            } catch (e) {
              if ((e as NodeJS.ErrnoException).code === "EEXIST") {
                return send(409, { error: "같은 시각의 폴더가 이미 있습니다. 잠시 뒤 다시 시도하세요." });
              }
              throw e;
            }
            for (const [file, content] of files) writeFileSync(resolve(dir, file), content, "utf8");

            send(200, {
              dir: `courses/${course}/export/${name}`,
              files: [...files.keys()],
              // 아직 만들 수 없는 형식은 알려 준다.
              skipped: formats.filter((f) => f !== "HTML"),
            });
          } catch (e) {
            send(500, { error: e instanceof Error ? e.message : String(e) });
          }
        });
      });
    },
  };
}
