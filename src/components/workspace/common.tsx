import { useState } from "react";
import { FileText, Pencil, Trash2, Download, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWorkspace } from "./provider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Credential } from "@/lib/workspace";
export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
export function RecordActions({
  table,
  id,
  document,
}: {
  table: "credentials" | "skills" | "tasks";
  id: string;
  document?: Credential;
}) {
  const w = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  async function download() {
    if (!document?.document_path) return;
    const { data, error } = await supabase.storage
      .from("credential-documents")
      .createSignedUrl(document.document_path, 60);
    if (error || !data) {
      toast.error("Could not open this document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <>
      <div className="action-icons">
        {document?.document_path && (
          <Button
            size="icon"
            variant="ghost"
            title="Open supporting document"
            aria-label="Open supporting document"
            onClick={() => {
              void download();
            }}
          >
            <Download />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          title="Edit"
          aria-label={`Edit ${table.slice(0, -1)}`}
          onClick={() =>
            w.open({
              kind: table === "credentials" ? "credential" : table === "skills" ? "skill" : "task",
              id,
            })
          }
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          aria-label={`Delete ${table.slice(0, -1)}`}
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogTitle>Delete this {table.slice(0, -1)}?</DialogTitle>
          <DialogDescription>
            This record will be permanently removed from your workspace.
          </DialogDescription>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await w.remove(table, id);
                  setConfirm(false);
                } catch {
                  toast.error("Could not delete this record. Please try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Deleting…" : "Delete record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function EmptyState({
  title = "No records yet",
  detail = "Your next step starts here.",
  kind,
}: {
  title?: string;
  detail?: string;
  kind?: "credential" | "skill" | "task";
}) {
  const { open } = useWorkspace();
  return (
    <div className="empty-state">
      <FileText />
      <h3>{title}</h3>
      <p>{detail}</p>
      {kind && (
        <Button onClick={() => open({ kind })}>
          <Plus />
          Add {kind}
        </Button>
      )}
    </div>
  );
}
export function SectionLink({
  to,
  children,
}: {
  to: "/" | "/credentials" | "/verification" | "/skills" | "/tasks" | "/profile";
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="section-link">
      {children}
      <ArrowRight />
    </Link>
  );
}
export function ErrorNotice() {
  const w = useWorkspace();
  if (!w.error) return null;
  return (
    <div className="feedback flex items-center gap-3 mb-5">
      <AlertCircle className="size-4" />
      Your workspace couldn’t load.
      <Button variant="link" size="sm" onClick={w.retry}>
        Try again
      </Button>
    </div>
  );
}
export function PrototypeFooter() {
  return (
    <footer className="dashboard-footer">
      <span>
        <span className="legend-dot" />
        Credential organization & skills validation prototype
      </span>
      <span>ILO Mini-Hackathon · 2026</span>
    </footer>
  );
}
