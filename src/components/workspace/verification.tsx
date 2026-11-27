import { useState } from "react";
import { ShieldCheck, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, PrototypeFooter, EmptyState, ErrorNotice } from "./common";
import { credentialStatuses, displayDate } from "@/lib/workspace";
export function Verification() {
  const w = useWorkspace();
  const [filter, setFilter] = useState("All requests");
  const items = w.credentials.filter(
    (c) =>
      (filter === "All requests" || c.status === filter) &&
      `${c.title} ${c.institution}`.toLowerCase().includes(w.search.toLowerCase()),
  );
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>Verification Tracking</h1>
          <p>A clear view of where every qualification stands.</p>
        </div>
        <ShieldCheck className="size-7 text-primary" />
      </div>
      <ErrorNotice />
      <div className="feedback flex gap-3 items-start">
        <ShieldCheck className="size-4 text-primary shrink-0 mt-1" />
        <span>
          <strong className="text-foreground">Organization, not official verification.</strong>{" "}
          Statuses are recorded by you. No institution reviews or accredits credentials through this
          prototype.
        </span>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">
          {["All requests", ...credentialStatuses].map((s) => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={filter === s ? "selected" : ""}
              onClick={() => setFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
      <div className="verification-list">
        {items.length ? (
          items.map((c) => {
            const level = c.status === "Approved" ? 3 : c.status === "Pending" ? 1 : 2;
            return (
              <section className="verification-item" key={c.id}>
                <div className="verification-top">
                  <div className="item-icon">
                    <FileText />
                  </div>
                  <div>
                    <h2>{c.title}</h2>
                    <p>
                      {c.institution} · {c.qualification_type} · {displayDate(c.award_date)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Update ${c.title} status`}
                    title="Update tracking status"
                    onClick={() => w.open({ kind: "credential", id: c.id })}
                  >
                    <Pencil />
                  </Button>
                </div>
                <div className="verification-steps">
                  {[
                    "Recorded",
                    "Pending",
                    "Under review",
                    c.status === "Rejected" ? "Rejected" : "Approved",
                  ].map((s, i) => (
                    <div className={`verification-step ${i <= level ? "reached" : ""}`} key={s}>
                      {s}
                    </div>
                  ))}
                </div>
                <div className="feedback">
                  <strong>Feedback: </strong>
                  {c.feedback || "No feedback recorded yet."}
                </div>
              </section>
            );
          })
        ) : (
          <EmptyState
            title="No requests found"
            detail="Add a credential to begin tracking."
            kind="credential"
          />
        )}
      </div>
      <PrototypeFooter />
    </main>
  );
}
