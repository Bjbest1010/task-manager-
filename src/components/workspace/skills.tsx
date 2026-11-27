import { useState } from "react";
import {
  Plus,
  Sparkles,
  GraduationCap,
  MessageSquare,
  Users,
  BriefcaseBusiness,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, RecordActions, EmptyState, PrototypeFooter, ErrorNotice } from "./common";
const categories = [
  "All skills",
  "Professional",
  "Academic",
  "Communication",
  "Interpersonal",
  "Technical",
];
const icons: Record<string, typeof Sparkles> = {
  Professional: BriefcaseBusiness,
  Academic: GraduationCap,
  Communication: MessageSquare,
  Interpersonal: Users,
  Technical: Code,
};
export function Skills() {
  const w = useWorkspace();
  const [category, setCategory] = useState("All skills");
  const [status, setStatus] = useState("All statuses");
  const items = w.skills.filter(
    (s) =>
      (category === "All skills" || s.category === category) &&
      (status === "All statuses" || status === s.status) &&
      `${s.title} ${s.experience}`.toLowerCase().includes(w.search.toLowerCase()),
  );
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>Skills Validation</h1>
          <p>The abilities and experience that make you, you.</p>
        </div>
        <Button onClick={() => w.open({ kind: "skill" })}>
          <Plus />
          Add skill
        </Button>
      </div>
      <ErrorNotice />
      <div className="feedback">
        Validation statuses are self-recorded. This prototype does not provide independent skills
        assessment.
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">
          {categories.map((c) => (
            <Button
              key={c}
              variant="ghost"
              size="sm"
              className={c === category ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <select
          aria-label="Filter skills by validation"
          className="field-select w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All statuses", "Validated", "Pending", "Not Validated"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <section className="skills-grid">
        {items.map((s) => {
          const Icon = icons[s.category] ?? Sparkles;
          return (
            <article className="skill-card" key={s.id}>
              <div className="flex items-center justify-between">
                <span className="item-icon">
                  <Icon />
                </span>
                <span className="text-xs text-muted-foreground">{s.category}</span>
              </div>
              <h2>{s.title}</h2>
              <p>{s.experience || "No experience recorded yet."}</p>
              <div className="skill-bottom">
                <StatusBadge status={s.status} />
                <RecordActions table="skills" id={s.id} />
              </div>
            </article>
          );
        })}
      </section>
      {!items.length && (
        <EmptyState
          title="No skills found"
          detail="Record an ability and the experience behind it."
          kind="skill"
        />
      )}
      <PrototypeFooter />
    </main>
  );
}
