import { createFileRoute } from "@tanstack/react-router";
import { Credentials } from "@/components/workspace/credentials";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/credentials")({
  head: () =>
    pageHead(
      "My Credentials",
      "Manage qualifications, institutions and supporting documents in your private Task Manager Pro workspace.",
    ),
  component: Credentials,
});
