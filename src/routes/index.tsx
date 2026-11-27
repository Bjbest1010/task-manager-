import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/workspace/dashboard";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Dashboard",
      "Your Task Manager Pro workspace: qualifications, verification progress, upcoming tasks and recent activity.",
    ),
  component: Dashboard,
});
