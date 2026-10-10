import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { EXPORT_ENDPOINT } from "./src/constants";

const pad = (n: number) => String(n).padStart(2, "0");

/** 연월일시분초 14자리(예: `20261010172130`). 서버의 현지 시각이다. */
const timestamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/**
 * 개발 서버에서 내보내기 폴더를 만든다: `courses/{강의}/export/{연월일시분초}/`.
 * 브라우저는 로컬 폴더를 만들 수 없어서 개발 서버가 대신 한다. 파일 생성은 형식별 export가 이어서 한다.
 */
export function exportFolder(): Plugin {
  return {
    name: "course-maker-export-folder",
    apply: "serve",
    configureServer(server) {
      const coursesDir = resolve(server.config.root, "courses");

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
        req.on("end", () => {
          let course: unknown;
          try {
            course = JSON.parse(raw).course;
          } catch {
            return send(400, { error: "요청을 읽지 못했습니다." });
          }
          // 강의 id는 courses/ 바로 아래 폴더 이름이다. 경로를 벗어나는 값은 받지 않는다.
          if (typeof course !== "string" || !/^[\w.-]+$/.test(course) || course === "." || course === "..") {
            return send(400, { error: "강의 이름이 올바르지 않습니다." });
          }
          const courseDir = resolve(coursesDir, course);
          if (!existsSync(resolve(courseDir, "meta.ts"))) return send(404, { error: `강의를 찾을 수 없습니다: ${course}` });

          const exportDir = resolve(courseDir, "export");
          const dir = resolve(exportDir, timestamp(new Date()));
          try {
            mkdirSync(exportDir, { recursive: true });
            mkdirSync(dir); // 같은 초에 두 번 실행하면 이미 있어 실패한다. 덮어쓰지 않는다.
          } catch (e) {
            const exists = (e as NodeJS.ErrnoException).code === "EEXIST";
            return send(exists ? 409 : 500, { error: exists ? "같은 시각의 폴더가 이미 있습니다. 잠시 뒤 다시 시도하세요." : String(e) });
          }
          send(200, { dir: `courses/${course}/export/${dir.split(/[\\/]/).pop()}` });
        });
      });
    },
  };
}
