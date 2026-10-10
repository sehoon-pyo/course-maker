import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const dataUri = (file: string, mime: string) => `data:${mime};base64,${readFileSync(file).toString("base64")}`;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 슬라이드 CSS의 폰트 파일 주소(`url("../assets/fonts/…")`)를 파일 안에 넣은 주소로 바꾼다. */
function inlineFonts(css: string, root: string): string {
  return css.replace(/url\("\.\.\/(assets\/fonts\/[^"]+\.ttf)"\)/g, (_, path) => `url("${dataUri(resolve(root, path), "font/ttf")}")`);
}

/**
 * 슬라이드 HTML의 이미지 경로(`/courses/…/logo.svg` 같은 개발 서버 주소)를 파일 안에 넣은 주소로 바꾼다.
 * 찾지 못하거나 바꾸지 못한 외부 경로가 남으면 파일이 외부에 의존하게 되므로 오류로 멈춘다.
 */
function inlineImages(html: string, root: string): string {
  const result = html.replace(/(["'(])(\/[^"'()?]+\.(?:svg|png|jpe?g|gif|webp))(?:\?[^"'()]*)?(["')])/gi, (_, open, path, close) => {
    const file = resolve(root, `.${decodeURIComponent(path)}`);
    if (!file.startsWith(root) || !existsSync(file)) throw new Error(`이미지 파일을 찾을 수 없습니다: ${path}`);
    return `${open}${dataUri(file, MIME[extname(file).toLowerCase()])}${close}`;
  });
  const left = result.match(/(?:src|href)="\/[^"]*"/);
  if (left) throw new Error(`파일 안에 넣지 못한 외부 경로가 남았습니다: ${left[0]}`);
  return result;
}

const VIEWER_CSS = `
html, body { height: 100%; margin: 0; background: #111827; overflow: hidden; }
body { font-family: var(--font-family); }
.viewer-page { display: none; position: absolute; left: 50%; top: 50%; width: 1920px; height: 1080px; transform-origin: center; overflow: hidden; background: #fff; }
.viewer-page.current { display: block; }
`;

/** 방향키(← →)로 슬라이드를 한 장씩 넘기고, 창 크기에 맞춰 비율을 유지해 줄인다. */
const VIEWER_JS = `
(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll(".viewer-page"));
  var index = 0;
  function show() {
    pages.forEach(function (p, i) { p.classList.toggle("current", i === index); });
  }
  function fit() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    pages.forEach(function (p) { p.style.transform = "translate(-50%, -50%) scale(" + scale + ")"; });
  }
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "ArrowRight" && index < pages.length - 1) index++;
    else if (e.key === "ArrowLeft" && index > 0) index--;
    else return;
    show();
  });
  window.addEventListener("resize", fit);
  fit();
  show();
})();
`;

/** chapter 하나의 슬라이드 조각들을 외부 파일에 의존하지 않는 HTML 문서 하나로 묶는다. */
export function buildChapterHtml(options: { title: string; slides: string[]; slideCss: string; root: string }): string {
  const { title, slides, slideCss, root } = options;
  const pages = slides
    // React가 이미지 앞에 붙이는 미리 불러오기 태그는 외부 주소를 가리키므로 뺀다.
    .map((html) => html.replace(/<link rel="preload"[^>]*\/>/g, ""))
    .map((html) => `<section class="viewer-page">${html}</section>`)
    .join("\n");
  const document = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${inlineFonts(slideCss, root)}
${VIEWER_CSS}</style>
</head>
<body>
${pages}
<script>${VIEWER_JS}</script>
</body>
</html>
`;
  return inlineImages(document, root);
}
