import { useState } from "react";
import { Plus, CalendarDays, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, RecordActions, EmptyState, PrototypeFooter, ErrorNotice } from "./common";
import { displayDate, isOverdue } from "@/lib/workspace";
import { toast } from "sonner";
export function Tasks() {
  const w = useWorkspace();
  const [status, setStatus] = useState("All tasks");
  const [priority, setPriority] = useState("All priorities");
  const today = new Date().toISOString().slice(0, 10);
  const items = w.tasks.filter(
    (t) =>
      (status === "All tasks" ||
        status === t.status ||
        (status === "Overdue" && isOverdue(t, today))) &&
      (priority === "All priorities" || t.priority === priority) &&
      `${t.title} ${t.description}`.toLowerCase().includes(w.search.toLowerCase()),
  );
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>My Tasks</h1>
          <p>Stay on top of submissions, deadlines and your next steps.</p>
        </div>
        <Button onClick={() => w.open({ kind: "task" })}>
          <Plus />
          Create task
        </Button>
      </div>
      <ErrorNotice />
      <div className="flex gap-5 text-xs text-muted-foreground mb-4">
        <span className="flex gap-2 items-center">
          <ListTodo className="size-4" />
          {w.tasks.filter((t) => t.status !== "Completed").length} open tasks
        </span>
        <span className="flex gap-2 items-center">
          <CalendarDays className="size-4" />
          {w.tasks.filter((t) => isOverdue(t, today)).length} overdue
        </span>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">
          {["All tasks", "To Do", "In Progress", "Completed", "Overdue"].map((s) => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={status === s ? "selected" : ""}
              onClick={() => setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        <select
          aria-label="Filter tasks by priority"
          className="field-select w-auto"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {["All priorities", "High", "Medium", "Low"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <section className="panel">
        {items.length ? (
          <div className="data-table-wrap">
            <table className="data-table mt-0">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Deadline</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-start gap-3 min-w-52">
                        <input
                          className="task-checkbox"
                          type="checkbox"
                          checked={t.status === "Completed"}
                          aria-label={`Complete ${t.title}`}
                          onChange={() => {
                            void w.complete(t).catch(() => toast.error("Could not update task"));
                          }}
                        />
                        <div>
                          <strong
                            className={`task-title ${t.status === "Completed" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {t.title}
                          </strong>
                          {t.description && <p className="muted-cell mt-1">{t.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`whitespace-nowrap text-[11px] ${isOverdue(t, today) ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {t.deadline ? displayDate(t.deadline) : "No deadline"}
                      {isOverdue(t, today) && (
                        <small className="block text-[9px] mt-1">Overdue</small>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <RecordActions table="tasks" id={t.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No tasks found"
            detail="Plan your next submission or follow-up."
            kind="task"
          />
        )}
      </section>
      <PrototypeFooter />
    </main>
  );
}
