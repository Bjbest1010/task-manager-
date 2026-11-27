import { Mail, GraduationCap, BriefcaseBusiness, Pencil, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { StatusBadge, PrototypeFooter, SectionLink, ErrorNotice } from "./common";
import { initials } from "@/lib/workspace";
export function Profile() {
  const w = useWorkspace();
  const p = w.profile;
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Your education, experience and achievements in one place.</p>
        </div>
        <Button variant="outline" onClick={() => w.open({ kind: "profile" })}>
          <Pencil />
          Edit profile
        </Button>
      </div>
      <ErrorNotice />
      {!w.user && (
        <div className="feedback">
          Example profile supplied for this prototype. Sign in to build your own private profile.
        </div>
      )}
      <section className="profile-band">
        <div className="avatar profile-avatar">{initials(p.name)}</div>
        <div>
          <h2>{p.name || "Your name"}</h2>
          <p>{p.experience || "Your professional journey"}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
            <Mail className="size-3.5" />
            {p.email}
          </div>
        </div>
      </section>
      <div className="profile-columns">
        <div>
          <section className="profile-section">
            <h2>
              <GraduationCap className="size-5 text-primary" />
              Education
            </h2>
            <div className="profile-entry">
              <span className="eyebrow">COMPLETED EDUCATION</span>
              <h3 className="mt-2">{p.education || "No completed education recorded."}</h3>
            </div>
            <div className="profile-entry">
              <span className="eyebrow">CURRENT EDUCATION</span>
              <h3 className="mt-2">{p.current_education || "No current education recorded."}</h3>
            </div>
          </section>
          <section className="profile-section">
            <h2>
              <BriefcaseBusiness className="size-5 text-primary" />
              Professional experience
            </h2>
            <div className="profile-entry">
              <h3>{p.experience || "No experience recorded yet."}</h3>
            </div>
          </section>
        </div>
        <div>
          <section className="profile-section">
            <div className="flex justify-between items-center">
              <h2>
                <FileText className="size-5 text-primary" />
                Qualifications
              </h2>
              <SectionLink to="/credentials">Manage</SectionLink>
            </div>
            {w.credentials.length ? (
              w.credentials.slice(0, 5).map((c) => (
                <div className="profile-entry" key={c.id}>
                  <h3>{c.title}</h3>
                  <p>{c.institution}</p>
                  <div className="mt-2">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No qualifications recorded yet.</p>
            )}
          </section>
          <section className="profile-section">
            <div className="flex justify-between items-center">
              <h2>
                <Sparkles className="size-5 text-primary" />
                Skills & abilities
              </h2>
              <SectionLink to="/skills">Manage</SectionLink>
            </div>
            <div className="flex gap-2 flex-wrap">
              {w.skills.length ? (
                w.skills.map((s) => (
                  <span className="badge" key={s.id}>
                    {s.title}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No skills recorded yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
      <PrototypeFooter />
    </main>
  );
}
