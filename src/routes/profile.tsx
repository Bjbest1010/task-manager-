import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/components/workspace/profile";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/profile")({
  head: () =>
    pageHead(
      "My Profile",
      "Your personal education, qualifications, skills and professional experience in Task Manager Pro.",
    ),
  component: Profile,
});
