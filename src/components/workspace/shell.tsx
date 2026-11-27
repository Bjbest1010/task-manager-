import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Files,
  ShieldCheck,
  Sparkles,
  ListTodo,
  UserRound,
  PanelLeftClose,
  Menu,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  LogOut,
  CircleHelp,
  ArrowUpRight,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./provider";
import { WorkspaceDialogs } from "./forms";
import { initials } from "@/lib/workspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const nav = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "My Credentials", to: "/credentials", icon: Files },
  { name: "Verification Tracking", to: "/verification", icon: ShieldCheck },
  { name: "Skills Validation", to: "/skills", icon: Sparkles },
  { name: "My Tasks", to: "/tasks", icon: ListTodo },
  { name: "My Profile", to: "/profile", icon: UserRound },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const w = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mini, setMini] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [read, setRead] = useState(false);
  const active = nav.find((n) => n.to === pathname);
  const name = w.user ? w.profile.name || "Your workspace" : w.profile.name;
  const alerts = w.activities.length
    ? w.activities.slice(0, 3).map((a) => ({ title: a.title, detail: a.detail }))
    : w.user
      ? []
      : [
          {
            title: "Degree review in progress",
            detail: "Your sample degree is marked Under Review.",
          },
          {
            title: "Supporting document needed",
            detail: "Complete the sample leadership certificate.",
          },
          { title: "Upcoming submission", detail: "Degree document task is due 30 Nov 2026." },
        ];
  return (
    <div className={mini ? "sidebar-mini" : ""}>
      {mobile && <div className="mobile-scrim" onClick={() => setMobile(false)} />}
      <aside className={`app-sidebar ${mini ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}>
        <Link to="/" className="brand" onClick={() => setMobile(false)}>
          <div className="brand-mark">
            <CheckCheck className="size-6" />
          </div>
          {(!mini || mobile) && (
            <div className="brand-name">
              TASK MANAGER
              <br />
              <span>PRO</span>
            </div>
          )}
        </Link>
        <div className="nav-label">{!mini || mobile ? "WORKSPACE" : "···"}</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={item.name}
              onClick={() => {
                setMobile(false);
                w.setSearch("");
              }}
              className={`nav-link ${pathname === item.to ? "active" : ""}`}
            >
              <item.icon />
              {(!mini || mobile) && (
                <>
                  <span>{item.name}</span>
                  {item.to === "/credentials" && (
                    <span className="nav-count">{w.credentials.length}</span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {(!mini || mobile) && (
            <>
              <div className="prototype-note">
                <strong className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Built for your next chapter
                </strong>
                Organize your credentials.
                <br />
                Make your experience count.
                <Button
                  variant="link"
                  className="p-0 h-auto mt-3 text-[11px]"
                  onClick={() => w.open({ kind: "help" })}
                >
                  About this prototype
                  <ArrowUpRight />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start mt-4 text-muted-foreground text-xs"
                onClick={() => w.open({ kind: "help" })}
              >
                <CircleHelp />
                Help & information
              </Button>
            </>
          )}
          <div className="side-profile">
            <div className="avatar">{initials(name)}</div>
            {(!mini || mobile) && (
              <div className="min-w-0 flex-1">
                <strong className="truncate">{name}</strong>
                <small>{w.user ? "Personal workspace" : "Demo workspace"}</small>
              </div>
            )}
            {(!mini || mobile) && (
              <Button
                size="icon"
                variant="ghost"
                title={w.user ? "Sign out" : "Sign in"}
                aria-label={w.user ? "Sign out" : "Sign in"}
                onClick={async () => {
                  if (w.user) {
                    const { error } = await supabase.auth.signOut();
                    if (error) toast.error("Could not sign out");
                  } else w.open({ kind: "auth" });
                }}
              >
                {w.user ? <LogOut className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </Button>
            )}
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
              onClick={() => {
                if (window.matchMedia("(max-width:760px)").matches) setMobile(!mobile);
                else setMini(!mini);
              }}
            >
              <span className="hidden md:block">
                <PanelLeftClose />
              </span>
              <span className="md:hidden">
                <Menu />
              </span>
            </Button>
            <span className="workspace-label">Workspace</span>
            <ChevronRight className="size-3 workspace-label" />
            <strong>{active?.name ?? "Account"}</strong>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <Search />
              <input
                aria-label="Search workspace"
                placeholder="Search anything..."
                value={w.search}
                onChange={(e) => w.setSearch(e.target.value)}
              />
            </label>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => {
                  setNotifications(!notifications);
                  setRead(true);
                }}
              >
                <Bell />
                {!read && alerts.length > 0 && <span className="notification-dot" />}
              </Button>
              {notifications && (
                <div className="notification-panel">
                  <div className="flex justify-between items-center">
                    <strong className="text-sm">Notifications</strong>
                    <Button variant="ghost" size="sm" onClick={() => setNotifications(false)}>
                      Close
                    </Button>
                  </div>
                  {alerts.length ? (
                    alerts.map((a, i) => (
                      <p key={i}>
                        <strong>{a.title}</strong>
                        <br />
                        {a.detail}
                      </p>
                    ))
                  ) : (
                    <p>You’re all caught up.</p>
                  )}
                </div>
              )}
            </div>
            <div className="top-divider" />
            <Button
              variant="ghost"
              className="px-1 gap-2"
              aria-label={w.user ? "Open profile" : "Sign in to save"}
              onClick={() => (w.user ? w.open({ kind: "profile" }) : w.open({ kind: "auth" }))}
            >
              <span className="avatar">{initials(name)}</span>
              <ChevronDown className="size-3" />
            </Button>
          </div>
        </header>
        {w.loading && <div className="loading-line" />}
        {children}
        <WorkspaceDialogs />
      </div>
    </div>
  );
}
