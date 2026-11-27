import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { credentialStatuses, skillStatuses, taskStatuses } from "@/lib/workspace";
import { useWorkspace } from "./provider";
import { toast } from "sonner";
function Field({
  name,
  label,
  value = "",
  type = "text",
  options,
  wide = false,
  required = false,
}: {
  name: string;
  label: string;
  value?: string | undefined;
  type?: string;
  options?: readonly string[];
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <div className={`form-field ${wide ? "wide" : ""}`}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      {options ? (
        <select className="field-select" id={name} name={name} defaultValue={value || options[0]}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className="field-input form-textarea"
          id={name}
          name={name}
          defaultValue={value}
        />
      ) : (
        <input
          className="field-input"
          id={name}
          name={name}
          type={type}
          defaultValue={value}
          required={required}
        />
      )}
    </div>
  );
}
const titles = {
  credential: "credential",
  skill: "skill",
  task: "task",
  profile: "profile",
  auth: "account",
  help: "prototype",
};
export function WorkspaceDialogs() {
  const w = useWorkspace();
  const modal = w.modal;
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const credential = w.credentials.find((c) => c.id === modal?.id);
  const skill = w.skills.find((s) => s.id === modal?.id);
  const task = w.tasks.find((t) => t.id === modal?.id);
  function close() {
    w.open(null);
    setError("");
    setFile(null);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const get = (key: string) => String(f.get(key) ?? "").trim();
    try {
      if (modal.kind === "credential")
        await w.saveCredential(
          {
            title: get("title"),
            institution: get("institution"),
            qualification_type: get("qualification_type"),
            award_date: get("award_date") || null,
            description: get("description"),
            status: get("status"),
            feedback: get("feedback"),
            document_path: credential?.document_path ?? null,
            document_name: credential?.document_name ?? null,
          },
          modal.id,
          file ?? undefined,
        );
      if (modal.kind === "skill")
        await w.saveSkill(
          {
            title: get("title"),
            category: get("category"),
            experience: get("experience"),
            status: get("status"),
          },
          modal.id,
        );
      if (modal.kind === "task")
        await w.saveTask(
          {
            title: get("title"),
            deadline: get("deadline") || null,
            priority: get("priority"),
            status: get("status"),
            description: get("description"),
          },
          modal.id,
        );
      if (modal.kind === "profile")
        await w.saveProfile({
          id: w.profile.id,
          name: get("name"),
          email: get("email"),
          education: get("education"),
          current_education: get("current_education"),
          experience: get("experience"),
        });
      if (modal.kind === "auth") {
        const result =
          mode === "signin"
            ? await supabase.auth.signInWithPassword({
                email: get("email"),
                password: get("password"),
              })
            : await supabase.auth.signUp({
                email: get("email"),
                password: get("password"),
                options: { data: { name: get("name") }, emailRedirectTo: window.location.origin },
              });
        if (result.error) throw new Error(result.error.message);
        if (mode === "signup" && !result.data.session) {
          toast.success("Check your email to confirm your account.");
          close();
        } else close();
      }
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "lovable") {
    setError("");
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
  }
  return (
    <Dialog
      open={Boolean(modal)}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
        else setError("");
      }}
    >
      <DialogContent
        className="max-w-xl max-sm:max-w-[calc(100%-24px)]"
        key={`${modal?.kind}-${modal?.id ?? "new"}`}
      >
        <DialogTitle>
          {modal?.kind === "auth"
            ? mode === "signin"
              ? "Welcome back"
              : "Create your account"
            : modal?.kind === "help"
              ? "About this prototype"
              : `${modal?.id || modal?.kind === "profile" ? "Edit" : "Add"} ${modal ? titles[modal.kind] : ""}`}
        </DialogTitle>
        <DialogDescription>
          {modal?.kind === "auth"
            ? "Your qualifications, skills and next steps. All in one place."
            : modal?.kind === "help"
              ? "Task Manager Pro · ILO Mini-Hackathon"
              : modal?.kind === "credential"
                ? "Record your qualification and supporting evidence."
                : "Keep your academic and professional journey up to date."}
        </DialogDescription>
        <div className="modal-body">
          {modal?.kind === "help" ? (
            <div className="space-y-4 py-3 text-sm leading-7">
              <ShieldCheck className="text-primary size-9" />
              <p>
                Task Manager Pro is a prototype for credential organization and verification
                tracking, developed for the ILO Mini-Hackathon credential recognition and skills
                validation track.
              </p>
              <p>
                Statuses and skills validation are self-recorded tracking labels, not official
                decisions. No institution or accreditation body is connected to this application.
              </p>
              <p>
                Sample credentials and activities are illustrative. Demo changes last for this
                session. Sign in to save your own private records and upload supporting documents.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-grid">
                {modal?.kind === "credential" && (
                  <>
                    <Field
                      name="title"
                      label="Qualification title"
                      value={credential?.title}
                      wide
                      required
                    />
                    <Field
                      name="institution"
                      label="Institution / training provider"
                      value={credential?.institution}
                      wide
                      required
                    />
                    <Field
                      name="qualification_type"
                      label="Qualification type"
                      value={credential?.qualification_type}
                      options={["Diploma", "Degree", "Certificate", "Other"]}
                    />
                    <Field
                      name="award_date"
                      label="Award date (if awarded)"
                      value={credential?.award_date ?? ""}
                      type="date"
                    />
                    <Field
                      name="description"
                      label="Description"
                      value={credential?.description}
                      wide
                      type="textarea"
                    />
                    <Field
                      name="status"
                      label="Recorded verification status"
                      value={credential?.status}
                      options={credentialStatuses}
                    />
                    <Field
                      name="feedback"
                      label="Feedback / reason"
                      value={credential?.feedback}
                      wide
                      type="textarea"
                    />
                    <div className="form-field wide">
                      <label className="field-label" htmlFor="document">
                        Supporting document
                      </label>
                      <label className="upload-zone" htmlFor="document">
                        <UploadCloud className="size-6 text-primary" />
                        <span>
                          {file?.name ?? credential?.document_name ?? "Choose a PDF, JPG or PNG"}
                        </span>
                        <small>Up to 10 MB · private document storage</small>
                        <input
                          id="document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={!w.user}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f && f.size > 10 * 1024 * 1024) {
                              setError("Please choose a file smaller than 10 MB.");
                              e.target.value = "";
                              return;
                            }
                            setFile(f ?? null);
                          }}
                        />
                      </label>
                      {!w.user && (
                        <Button
                          variant="link"
                          size="sm"
                          type="button"
                          onClick={() => w.open({ kind: "auth" })}
                        >
                          Sign in to upload documents
                        </Button>
                      )}
                    </div>
                    <p className="form-note form-field wide">
                      Tracking labels are self-recorded and do not represent official institutional
                      verification.
                    </p>
                  </>
                )}
                {modal?.kind === "skill" && (
                  <>
                    <Field name="title" label="Skill name" value={skill?.title} wide required />
                    <Field
                      name="category"
                      label="Category"
                      value={skill?.category}
                      options={[
                        "Professional",
                        "Academic",
                        "Communication",
                        "Interpersonal",
                        "Technical",
                      ]}
                    />
                    <Field
                      name="status"
                      label="Recorded validation status"
                      value={skill?.status}
                      options={skillStatuses}
                    />
                    <Field
                      name="experience"
                      label="Relevant experience / evidence"
                      value={skill?.experience}
                      wide
                      type="textarea"
                    />
                    <p className="form-note form-field wide">
                      Validation labels are self-recorded; no external assessment is performed.
                    </p>
                  </>
                )}
                {modal?.kind === "task" && (
                  <>
                    <Field name="title" label="Task title" value={task?.title} wide required />
                    <Field
                      name="deadline"
                      label="Deadline"
                      value={task?.deadline ?? ""}
                      type="date"
                    />
                    <Field
                      name="priority"
                      label="Priority"
                      value={task?.priority}
                      options={["Low", "Medium", "High"]}
                    />
                    <Field
                      name="status"
                      label="Status"
                      value={task?.status}
                      options={taskStatuses}
                    />
                    <Field
                      name="description"
                      label="Notes"
                      value={task?.description}
                      wide
                      type="textarea"
                    />
                  </>
                )}
                {modal?.kind === "profile" && (
                  <>
                    <Field name="name" label="Full name" value={w.profile.name} wide required />
                    <Field
                      name="email"
                      label="Contact email"
                      value={w.profile.email}
                      type="email"
                      wide
                      required
                    />
                    <Field
                      name="education"
                      label="Completed education"
                      value={w.profile.education}
                      wide
                      type="textarea"
                    />
                    <Field
                      name="current_education"
                      label="Current education"
                      value={w.profile.current_education}
                      wide
                      type="textarea"
                    />
                    <Field
                      name="experience"
                      label="Professional experience"
                      value={w.profile.experience}
                      wide
                      type="textarea"
                    />
                  </>
                )}
                {modal?.kind === "auth" && (
                  <>
                    {mode === "signup" && <Field name="name" label="Full name" wide required />}
                    <Field name="email" label="Email address" type="email" wide required />
                    <div className="form-field wide">
                      <label className="field-label" htmlFor="password">
                        Password
                      </label>
                      <input
                        className="field-input"
                        name="password"
                        id="password"
                        type="password"
                        minLength={8}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              {error && (
                <p className="text-destructive text-xs mt-4" role="alert">
                  {error}
                </p>
              )}
              <div className="form-actions">
                {modal?.kind !== "auth" && (
                  <Button type="button" variant="outline" onClick={close}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={busy}
                  className={modal?.kind === "auth" ? "w-full" : ""}
                >
                  {busy
                    ? "Saving…"
                    : modal?.kind === "auth"
                      ? mode === "signin"
                        ? "Sign in"
                        : "Create account"
                      : "Save changes"}
                </Button>
              </div>
              {modal?.kind === "auth" && (
                <>
                  <div className="auth-switch">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setError("");
                      }}
                    >
                      {mode === "signin"
                        ? "New here? Create an account"
                        : "Already have an account? Sign in"}
                    </Button>
                  </div>
                  <div className="auth-divider">or continue with</div>
                  <Button
                    variant="outline"
                    className="auth-provider"
                    type="button"
                    onClick={() => {
                      void social("google");
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="auth-provider"
                    onClick={() => {
                      void social("lovable");
                    }}
                  >
                    <LovableMark />
                    Continue with Lovable
                  </Button>
                  {mode === "signin" && (
                    <div className="auth-switch">
                      <Link
                        to="/reset-password"
                        className="section-link justify-center"
                        onClick={close}
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}
                </>
              )}
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
