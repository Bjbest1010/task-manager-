import {
  CalendarDays,
  Plus,
  Files,
  Clock3,
  CircleCheck,
  CircleX,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Check,
  Upload,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, SectionLink, PrototypeFooter, EmptyState, ErrorNotice } from "./common";
import { displayDate, verificationProgress } from "@/lib/workspace";
import illustration from "@/assets/credentials-illustration.png.asset.json";
import { toast } from "sonner";
export function Dashboard() {
  const w = useWorkspace();
  const progress = verificationProgress(w.credentials);
  const approved = w.credentials.filter((c) => c.status === "Approved").length;
  const pending = w.credentials.filter(
    (c) => c.status === "Pending" || c.status === "Under Review",
  ).length;
  const rejected = w.credentials.filter((c) => c.status === "Rejected").length;
  const name = w.user ? w.profile.name.split(" ")[0] || "there" : "Bishara";
  const q = w.search.toLowerCase();
  const credentials = w.credentials
    .filter((c) => `${c.title} ${c.institution} ${c.status}`.toLowerCase().includes(q))
    .slice(0, 4);
  const tasks = w.tasks
    .filter((t) => t.status !== "Completed" && t.title.toLowerCase().includes(q))
    .slice(0, 3);
  const stats = [
    {
      label: "Total credentials",
      value: w.credentials.length,
      icon: Files,
      tone: "",
      foot: "Your academic & professional records",
    },
    {
      label: "Approved credentials",
      value: approved,
      icon: CircleCheck,
      tone: "tone-success",
      foot: "Recorded as approved",
    },
    {
      label: "Pending verification",
      value: pending,
      icon: Clock3,
      tone: "tone-warning",
      foot: "Pending or under review",
    },
    {
      label: "Rejected credentials",
      value: rejected,
      icon: CircleX,
      tone: "tone-danger",
      foot: "May need additional information",
    },
  ];
  const activities = w.activities.length
    ? w.activities.slice(0, 3)
    : w.user
      ? w.credentials
          .slice(0, 3)
          .map((c) => ({ title: "Credential added", detail: c.title, time: c.created_at }))
      : [
          {
            title: "Credential marked approved",
            detail: "Diploma in Public Administration",
            time: "Sample activity",
          },
          {
            title: "Supporting document submitted",
            detail: "Bachelor of Arts in Political Science",
            time: "Sample activity",
          },
          { title: "New skill added", detail: "Community engagement", time: "Sample activity" },
        ];
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>A little organization. A lot of possibility.</p>
        </div>
        <div className="date-label">
          <CalendarDays className="size-4" />
          {new Date().toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
      <ErrorNotice />
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span className="size-1.5 rounded-full bg-primary" />
            YOUR PROFESSIONAL JOURNEY
          </div>
          <h2>
            Welcome back, {name} <span className="welcome-wave">✦</span>
          </h2>
          <p>
            Your qualifications tell your story. Keep them organized,
            <br className="hidden lg:block" /> track your progress, and take the next step with
            confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => w.open({ kind: "credential" })}>
              <Plus />
              Add credential
            </Button>
            <Button variant="outline" onClick={() => w.open({ kind: "task" })}>
              Create a task
              <ArrowUpRight />
            </Button>
          </div>
        </div>
        <img
          className="welcome-image"
          src={illustration.url}
          alt="A diploma, blue graduation cap and books"
        />
      </section>
      <section className="stats-grid" aria-label="Credential overview">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-header">
              <span>{s.label}</span>
              <div className={`stat-icon ${s.tone}`}>
                <s.icon />
              </div>
            </div>
            <div className="stat-number">{s.value.toString().padStart(2, "0")}</div>
            <div className="stat-foot">
              {s.tone === "tone-success" && <Check className="size-3 text-success" />}
              {s.foot}
            </div>
          </div>
        ))}
      </section>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Verification overview</h2>
              <p>Every credential, one step closer.</p>
            </div>
            <SectionLink to="/verification">View details</SectionLink>
          </div>
          <div className="progress-content">
            <div className="donut">
              <svg viewBox="0 0 160 160" aria-label={`${progress}% approved`}>
                <circle className="donut-track" cx="80" cy="80" r="65" />
                <circle
                  className="donut-value"
                  cx="80"
                  cy="80"
                  r="65"
                  strokeDasharray={`${progress * 4.084} 408.4`}
                />
              </svg>
              <div className="donut-label">
                <strong>{progress}%</strong>
                <span>Approved</span>
              </div>
            </div>
            <div className="legend">
              {[
                { label: "Approved", key: "approved", count: approved },
                {
                  label: "Pending",
                  key: "pending",
                  count: w.credentials.filter((c) => c.status === "Pending").length,
                },
                {
                  label: "Under review",
                  key: "review",
                  count: w.credentials.filter((c) => c.status === "Under Review").length,
                },
                { label: "Rejected", key: "rejected", count: rejected },
              ].map((l) => (
                <div className="legend-line" key={l.key}>
                  <span>
                    <i className={`legend-dot ${l.key}`} />
                    {l.label}
                  </span>
                  <strong>{l.count.toString().padStart(2, "0")}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="progress-footer">
            <ShieldCheck className="size-3.5" />
            Self-recorded tracking · not official institutional verification
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Upcoming tasks{" "}
                <span className="text-muted-foreground font-normal text-xs">({tasks.length})</span>
              </h2>
              <p>Small steps. Meaningful progress.</p>
            </div>
            <SectionLink to="/tasks">View all</SectionLink>
          </div>
          <div className="task-list">
            {tasks.length ? (
              tasks.map((t) => (
                <div className="task-row" key={t.id}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    aria-label={`Complete ${t.title}`}
                    checked={t.status === "Completed"}
                    onChange={() => {
                      void w.complete(t).catch(() => toast.error("Could not update task"));
                    }}
                  />
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      <CalendarDays />
                      {t.deadline ? displayDate(t.deadline) : "No deadline"}
                      <span>·</span>
                      {t.status}
                    </div>
                  </div>
                  <StatusBadge status={t.priority} />
                </div>
              ))
            ) : (
              <EmptyState
                title="Nothing on your to-do list"
                detail="Make space for your next step."
                kind="task"
              />
            )}
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent credentials</h2>
              <p>Your qualifications, at a glance.</p>
            </div>
            <SectionLink to="/credentials">View all</SectionLink>
          </div>
          {credentials.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Credential</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="credential-cell">
                          <span className="item-icon">
                            <FileText />
                          </span>
                          <div>
                            <strong>{c.title}</strong>
                            <small>{c.institution}</small>
                          </div>
                        </div>
                      </td>
                      <td className="muted-cell">{c.qualification_type}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View credential"
                          aria-label={`View ${c.title}`}
                          onClick={() => w.open({ kind: "credential", id: c.id })}
                        >
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={q ? "No matching credentials" : "Your story starts here"}
              detail={q ? "Try a different search." : "Add your first qualification."}
              kind="credential"
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent activity</h2>
              <p>
                {w.user ? "The latest in your workspace." : "A snapshot of the sample journey."}
              </p>
            </div>
            <Clock3 className="size-4 text-muted-foreground" />
          </div>
          <div className="activity-list">
            {activities.length ? (
              activities.map((a, i) => (
                <div className="activity-item" key={`${a.title}-${i}`}>
                  <span
                    className={`activity-icon ${i === 1 ? "tone-review" : i === 2 ? "tone-warning" : ""}`}
                  >
                    {i === 0 ? <Check /> : i === 1 ? <Upload /> : <Sparkles />}
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.detail}</p>
                    <time>
                      {a.time === "Sample activity"
                        ? "Illustrative activity"
                        : new Date(a.time).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="A fresh start" detail="Your recent additions will appear here." />
            )}
          </div>
        </section>
      </div>
      {!w.user && (
        <div className="demo-saving">
          <ShieldCheck className="size-4" />
          <span>
            You’re exploring sample data. <strong>Make this workspace yours.</strong>
          </span>
          <Button variant="link" size="sm" onClick={() => w.open({ kind: "auth" })}>
            Sign in to save
            <ArrowRight />
          </Button>
        </div>
      )}
      <PrototypeFooter />
    </main>
  );
}
