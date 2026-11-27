import { createFileRoute } from "@tanstack/react-router";
import { Skills } from "@/components/workspace/skills";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/skills")({
  head: () =>
    pageHead(
      "Skills Validation",
      "Organize your professional and academic skills, experience and recorded validation status.",
    ),
  component: Skills,
});
