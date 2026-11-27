import { createFileRoute } from "@tanstack/react-router";
import { Verification } from "@/components/workspace/verification";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/verification")({
  head: () =>
    pageHead(
      "Verification Tracking",
      "Track self-recorded credential review statuses and feedback in the Task Manager Pro prototype.",
    ),
  component: Verification,
});
