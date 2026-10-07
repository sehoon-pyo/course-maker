import { useCallback, useEffect, useState } from "react";

const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));

/** `#/{강의}/{chapter}/{section}/{slide}` 해시를 키(`강의/chapter/section/slide`)로 읽고 쓴다. */
export function useHashRoute() {
  const [key, setKey] = useState(read);

  useEffect(() => {
    const onChange = () => setKey(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((next: string) => {
    window.location.hash = "/" + next.split("/").map(encodeURIComponent).join("/");
  }, []);

  return [key, go] as const;
}
