import { createFileRoute } from "@tanstack/react-router";
import { Tasks } from "@/components/workspace/tasks";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/tasks")({
  head: () =>
    pageHead(
      "My Tasks",
      "Manage credential submissions, follow-ups, priorities and deadlines with Task Manager Pro.",
    ),
  component: Tasks,
});
