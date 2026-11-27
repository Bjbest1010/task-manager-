import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  sampleProfile,
  type Credential,
  type Skill,
  type Task,
  type Profile,
} from "@/lib/workspace";
import type { TablesInsert } from "@/integrations/supabase/types";
export type Modal = {
  kind: "credential" | "skill" | "task" | "profile" | "auth" | "help";
  id?: string;
} | null;
type Data = { credentials: Credential[]; skills: Skill[]; tasks: Task[]; profile: Profile };
type Activity = { title: string; detail: string; time: string };
type Workspace = Data & {
  user: User | null;
  loading: boolean;
  error: boolean;
  modal: Modal;
  open: (modal: Modal) => void;
  search: string;
  setSearch: (q: string) => void;
  activities: Activity[];
  saveCredential: (data: TablesInsert<"credentials">, id?: string, file?: File) => Promise<void>;
  saveSkill: (data: TablesInsert<"skills">, id?: string) => Promise<void>;
  saveTask: (data: TablesInsert<"tasks">, id?: string) => Promise<void>;
  saveProfile: (data: Profile) => Promise<void>;
  remove: (table: "credentials" | "skills" | "tasks", id: string) => Promise<void>;
  complete: (task: Task) => Promise<void>;
  retry: () => void;
};
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [modal, open] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [demo, setDemo] = useState<Data | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const qc = useQueryClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setUser(session?.user ?? null);
        setReady(true);
        setDemo(null);
        setActivities([]);
        open(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const query = useQuery({
    queryKey: ["workspace", user?.id ?? "demo"],
    enabled: ready,
    queryFn: async () => {
      const credentialsQuery = supabase
        .from("credentials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      const skillsQuery = supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      const tasksQuery = supabase
        .from("tasks")
        .select("*")
        .order("deadline", { ascending: true })
        .limit(500);
      const [c, s, t, p] = await Promise.all([
        user ? credentialsQuery.eq("user_id", user.id) : credentialsQuery.is("user_id", null),
        user ? skillsQuery.eq("user_id", user.id) : skillsQuery.is("user_id", null),
        user ? tasksQuery.eq("user_id", user.id) : tasksQuery.is("user_id", null),
        user
          ? supabase.from("profiles").select("*").eq("id", user.id).single()
          : Promise.resolve({ data: sampleProfile, error: null }),
      ]);
      if (c.error || s.error || t.error || p.error)
        throw new Error("Could not load your workspace.");
      return {
        credentials: c.data ?? [],
        skills: s.data ?? [],
        tasks: t.data ?? [],
        profile: p.data ?? sampleProfile,
      };
    },
    staleTime: 30000,
  });
  const data = (!user && demo) ||
    query.data || { credentials: [], skills: [], tasks: [], profile: sampleProfile };
  const record = (title: string, detail: string) =>
    setActivities((a) => [{ title, detail, time: new Date().toISOString() }, ...a].slice(0, 20));
  const finish = (title: string, detail: string) => {
    record(title, detail);
    toast.success(user ? "Changes saved" : "Updated in this demo session");
    open(null);
    if (user) void qc.invalidateQueries({ queryKey: ["workspace", user.id] });
  };
  async function saveCredential(values: TablesInsert<"credentials">, id?: string, file?: File) {
    let documentPath = values.document_path ?? null;
    let documentName = values.document_name ?? null;
    if (file) {
      if (!user) throw new Error("Sign in to securely upload supporting documents.");
      const path = `${user.id}/${crypto.randomUUID()}/${file.name}`;
      const { error } = await supabase.storage.from("credential-documents").upload(path, file);
      if (error) throw new Error(error.message);
      documentPath = path;
      documentName = file.name;
    }
    const payload = {
      ...values,
      user_id: user?.id ?? null,
      document_path: documentPath,
      document_name: documentName,
    };
    if (user) {
      const result = id
        ? await supabase.from("credentials").update(payload).eq("id", id)
        : await supabase.from("credentials").insert(payload);
      if (result.error) throw new Error(result.error.message);
    } else {
      const row: Credential = {
        id: id ?? crypto.randomUUID(),
        created_at: new Date().toISOString(),
        award_date: null,
        description: "",
        feedback: "",
        qualification_type: "Diploma",
        status: "Pending",
        ...payload,
      };
      setDemo({
        ...data,
        credentials: id
          ? data.credentials.map((c) => (c.id === id ? row : c))
          : [row, ...data.credentials],
      });
    }
    finish(id ? "Credential updated" : "Credential added", values.title);
  }
  async function saveSkill(values: TablesInsert<"skills">, id?: string) {
    const payload = { ...values, user_id: user?.id ?? null };
    if (user) {
      const result = id
        ? await supabase.from("skills").update(payload).eq("id", id)
        : await supabase.from("skills").insert(payload);
      if (result.error) throw new Error(result.error.message);
    } else {
      const row: Skill = {
        id: id ?? crypto.randomUUID(),
        created_at: new Date().toISOString(),
        category: "Professional",
        experience: "",
        status: "Not Validated",
        ...payload,
      };
      setDemo({
        ...data,
        skills: id ? data.skills.map((s) => (s.id === id ? row : s)) : [row, ...data.skills],
      });
    }
    finish(id ? "Skill updated" : "Skill added", values.title);
  }
  async function saveTask(values: TablesInsert<"tasks">, id?: string) {
    const payload = { ...values, user_id: user?.id ?? null };
    if (user) {
      const result = id
        ? await supabase.from("tasks").update(payload).eq("id", id)
        : await supabase.from("tasks").insert(payload);
      if (result.error) throw new Error(result.error.message);
    } else {
      const row: Task = {
        id: id ?? crypto.randomUUID(),
        created_at: new Date().toISOString(),
        deadline: null,
        description: "",
        priority: "Medium",
        status: "To Do",
        ...payload,
      };
      setDemo({
        ...data,
        tasks: id ? data.tasks.map((t) => (t.id === id ? row : t)) : [row, ...data.tasks],
      });
    }
    finish(id ? "Task updated" : "Task added", values.title);
  }
  async function saveProfile(profile: Profile) {
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ ...profile, id: user.id })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
    } else setDemo({ ...data, profile });
    finish("Profile updated", profile.name);
  }
  async function remove(table: "credentials" | "skills" | "tasks", id: string) {
    if (user) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
      void qc.invalidateQueries({ queryKey: ["workspace", user.id] });
    } else setDemo({ ...data, [table]: data[table].filter((r) => r.id !== id) });
    record("Record deleted", table);
    toast.success("Record deleted");
  }
  async function complete(task: Task) {
    await saveTask(
      { ...task, status: task.status === "Completed" ? "To Do" : "Completed" },
      task.id,
    );
  }
  return (
    <Context.Provider
      value={{
        ...data,
        user,
        loading: !ready || query.isLoading,
        error: query.isError,
        modal,
        open,
        search,
        setSearch,
        activities,
        saveCredential,
        saveSkill,
        saveTask,
        saveProfile,
        remove,
        complete,
        retry: () => {
          void query.refetch();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace provider is required");
  return context;
}
