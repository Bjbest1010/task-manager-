import { describe, expect, it } from "vitest";
import { credentialStatuses, verificationProgress, isOverdue } from "@/lib/workspace";
describe("Credential tracking rules", () => {
  it("supports Pending, Under Review, Approved and Rejected", () => {
    expect([...credentialStatuses]).toEqual(["Pending", "Under Review", "Approved", "Rejected"]);
  });
  it("only approved credentials count toward approval progress", () => {
    expect(
      verificationProgress([
        { status: "Pending" },
        { status: "Under Review" },
        { status: "Approved" },
        { status: "Rejected" },
      ]),
    ).toBe(25);
  });
  it("handles an empty workspace without a false progress value", () => {
    expect(verificationProgress([])).toBe(0);
  });
  it("completed tasks are not overdue", () => {
    expect(isOverdue({ deadline: "2026-11-25", status: "Completed" }, "2026-11-27")).toBe(false);
  });
  it("incomplete tasks past their deadline are overdue", () => {
    expect(isOverdue({ deadline: "2026-11-25", status: "To Do" }, "2026-11-27")).toBe(true);
  });
});
