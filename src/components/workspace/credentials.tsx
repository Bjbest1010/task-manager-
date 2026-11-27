import { useState } from "react";
import { FileText, Plus, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, RecordActions, EmptyState, PrototypeFooter, ErrorNotice } from "./common";
import { credentialStatuses, displayDate } from "@/lib/workspace";
export function Credentials() {
  const w = useWorkspace();
  const [filter, setFilter] = useState("All credentials");
  const [sort, setSort] = useState("Newest first");
  const items = w.credentials
    .filter(
      (c) =>
        (filter === "All credentials" || c.status === filter) &&
        `${c.title} ${c.institution} ${c.qualification_type}`
          .toLowerCase()
          .includes(w.search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "Title A–Z"
        ? a.title.localeCompare(b.title)
        : sort === "Award date"
          ? String(b.award_date).localeCompare(String(a.award_date))
          : b.created_at.localeCompare(a.created_at),
    );
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>My Credentials</h1>
          <p>Your academic achievements and professional qualifications, together.</p>
        </div>
        <Button onClick={() => w.open({ kind: "credential" })}>
          <Plus />
          Add credential
        </Button>
      </div>
      <ErrorNotice />
      <div className="feedback flex items-center gap-3">
        <ShieldCheck className="size-4 text-primary shrink-0" />
        {w.user
          ? "Your records are private. Verification statuses are self-recorded tracking labels."
          : "Sample workspace · demo changes last for this session. Sign in to save your own private records."}
      </div>
      <div className="filter-bar">
        <div className="filter-tabs">
          {["All credentials", ...credentialStatuses].map((s) => (
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
        <label className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          <select
            aria-label="Sort credentials"
            className="field-select w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {["Newest first", "Title A–Z", "Award date"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <section className="panel">
        {items.length ? (
          <div className="data-table-wrap">
            <table className="data-table mt-0">
              <thead>
                <tr>
                  <th>Qualification</th>
                  <th>Type</th>
                  <th>Award date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
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
                    <td className="muted-cell whitespace-nowrap">{displayDate(c.award_date)}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <RecordActions table="credentials" id={c.id} document={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No credentials found"
            detail="Add a qualification or adjust your filters."
            kind="credential"
          />
        )}
      </section>
      <p className="text-xs text-muted-foreground mt-4">
        {items.length} credential{items.length !== 1 ? "s" : ""} · Up to 500 recent records
      </p>
      <PrototypeFooter />
    </main>
  );
}
