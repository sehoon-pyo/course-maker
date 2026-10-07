import { Inlines, type PlacementProps, type Sentence } from "@/elements";
import "./bullets.css";

/** 이 강의의 불릿. 도구의 `Bullets`와 같은 이름·같은 속성이고, 점 대신 ▸를 쓴다. 같은 이름이면 강의의 것이 우선한다. */
export function Bullets({ items }: { items: Sentence[] } & PlacementProps) {
  return (
    <ul className="sample2-bullets">
      {items.map((item, i) => (
        <li key={i}>
          <Inlines value={item} />
        </li>
      ))}
    </ul>
  );
}
Bullets.slotKinds = ["body", "free"] as const;
