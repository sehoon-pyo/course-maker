import { useEffect, useState } from "react";
import { courses } from "@/courses";
import { EXPORT_ENDPOINT, EXPORT_FORMATS } from "@/constants";

type Format = (typeof EXPORT_FORMATS)[number];

interface ExportModalProps {
  /** 처음에 선택해 둘 course와 chapter (지금 보고 있는 것) */
  initialCourseId: string;
  initialChapterId: string;
  onClose: () => void;
}

/** 내보내기 모달: course, chapter(여러 개), 파일 형식(여러 개)을 고르고 `export/{연월일시분초}/` 폴더에 저장한다. */
export function ExportModal({ initialCourseId, initialChapterId, onClose }: ExportModalProps) {
  const [courseId, setCourseId] = useState(initialCourseId);
  const [chapterIds, setChapterIds] = useState<string[]>([initialChapterId]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string }>();

  const course = courses.find((c) => c.id === courseId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const selectCourse = (id: string) => {
    setCourseId(id);
    setChapterIds([]);
    setResult(undefined);
  };

  const canRun = !busy && !!course && chapterIds.length > 0 && formats.length > 0;

  const run = async () => {
    setBusy(true);
    setResult(undefined);
    try {
      const res = await fetch(EXPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseId, chapters: chapterIds, formats }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `요청에 실패했습니다(${res.status})`);
      const skipped: string[] = body.skipped;
      setResult({
        ok: true,
        message: [
          body.dir,
          ...(body.files.length ? body.files : ["만든 파일이 없습니다."]),
          ...(skipped.length ? [`${skipped.join(", ")}은(는) 아직 만들 수 없어 건너뛰었습니다.`] : []),
        ].join("\n"),
      });
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <h2 id="export-title">내보내기</h2>

        <label className="modal-field">
          <span>강의</span>
          <select value={courseId} onChange={(e) => selectCourse(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="modal-field">
          <legend>chapter</legend>
          {course?.chapters.length ? (
            course.chapters.map((ch, i) => (
              <label key={ch.id} className="modal-check">
                <input type="checkbox" checked={chapterIds.includes(ch.id)} onChange={() => setChapterIds((ids) => toggle(ids, ch.id))} />
                <span>
                  {i + 1}. {ch.title}
                </span>
              </label>
            ))
          ) : (
            <p className="modal-hint">이 강의에는 chapter가 없습니다.</p>
          )}
        </fieldset>

        <fieldset className="modal-field">
          <legend>파일 형식</legend>
          <div className="modal-row">
            {EXPORT_FORMATS.map((f) => (
              <label key={f} className="modal-check">
                <input type="checkbox" checked={formats.includes(f)} onChange={() => setFormats((list) => toggle(list, f))} />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="modal-hint">
          저장 위치: <code>courses/{courseId}/export/연월일시분초/</code>. 지금은 HTML만 만들 수 있고 PPTX, PDF는 아직 없습니다.
        </p>
        {result && <p className={result.ok ? "modal-result" : "modal-result modal-error"}>{result.message}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            닫기
          </button>
          <button type="button" className="modal-primary" onClick={run} disabled={!canRun}>
            {busy ? "만드는 중…" : "내보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
