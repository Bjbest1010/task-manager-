import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/workspace";
export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Reset Password", "Securely reset your Task Manager Pro account password."),
  component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setRecovery(window.location.hash.includes("type=recovery"));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const result = recovery
      ? await supabase.auth.updateUser({ password: String(f.get("password")) })
      : await supabase.auth.resetPasswordForEmail(String(f.get("email")), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
    setMessage(
      result.error
        ? result.error.message
        : recovery
          ? "Password updated. You can now use your new password."
          : "Check your email for a secure password reset link.",
    );
    setBusy(false);
  }
  return (
    <main className="page">
      <div className="max-w-md mx-auto pt-12">
        <ShieldCheck className="size-10 text-primary mb-5" />
        <h1 className="text-2xl font-bold mb-3">
          {recovery ? "Choose a new password" : "Reset your password"}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {recovery
            ? "Set a new password for your account."
            : "We’ll send a secure link to your email address."}
        </p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="reset-input">
            {recovery ? "New password" : "Email address"}
          </label>
          <input
            className="field-input"
            name={recovery ? "password" : "email"}
            id="reset-input"
            type={recovery ? "password" : "email"}
            minLength={recovery ? 8 : undefined}
            required
          />
          <Button className="w-full mt-4" disabled={busy}>
            {busy ? "Please wait…" : recovery ? "Update password" : "Send reset link"}
          </Button>
          {message && (
            <p role="status" className="text-sm mt-4">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
