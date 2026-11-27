import type { Tables } from "@/integrations/supabase/types";
export type Credential = Tables<"credentials">;
export type Skill = Tables<"skills">;
export type Task = Tables<"tasks">;
export type Profile = Tables<"profiles">;
export const credentialStatuses = ["Pending", "Under Review", "Approved", "Rejected"] as const;
export const skillStatuses = ["Not Validated", "Pending", "Validated"] as const;
export const taskStatuses = ["To Do", "In Progress", "Completed"] as const;
export const sampleProfile: Profile = {
  id: "demo",
  name: "Bishara Bare Sahal",
  email: "bbishara99@gmail.com",
  education: "Diploma in Public Administration and Political Science, Garissa University",
  current_education: "Bachelor of Arts in Political Science, Garissa University",
  experience: "Protection Officer, HCRI",
};
export function verificationProgress(credentials: Pick<Credential, "status">[]) {
  return credentials.length
    ? Math.round(
        (credentials.filter((c) => c.status === "Approved").length / credentials.length) * 100,
      )
    : 0;
}
export function isOverdue(task: Pick<Task, "status" | "deadline">, today: string) {
  return task.status !== "Completed" && Boolean(task.deadline && task.deadline < today);
}
export function displayDate(value: string | null) {
  return value
    ? new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not yet awarded";
}
export function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s.charAt(0))
      .join("")
      .toUpperCase() || "ME"
  );
}
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | Task Manager Pro` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Task Manager Pro` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
