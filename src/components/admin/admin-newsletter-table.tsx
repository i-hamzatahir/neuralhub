"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeactivateSubscriberAction } from "@/lib/actions/newsletter";
import { Button } from "@/components/ui/button";

interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  isActive: boolean;
  source: string | null;
  subscribedAt: Date;
}

export function AdminNewsletterTable({
  subscribers,
}: {
  subscribers: SubscriberRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDeactivate(id: string) {
    if (!confirm("Deactivate this subscriber?")) return;
    startTransition(async () => {
      await adminDeactivateSubscriberAction(id);
      router.refresh();
    });
  }

  if (subscribers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No subscribers yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Name</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Source</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{sub.email}</td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {sub.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    sub.isVerified && sub.isActive
                      ? "bg-success/20 text-success"
                      : sub.isActive
                        ? "bg-warning/20 text-warning"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {!sub.isActive
                    ? "Unsubscribed"
                    : sub.isVerified
                      ? "Active"
                      : "Pending"}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {sub.source ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {sub.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDeactivate(sub.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
