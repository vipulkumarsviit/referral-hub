"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

type FeedbackItem = {
  id: string;
  type: "issue" | "feature";
  email?: string;
  message: string;
  status: "new" | "reviewed";
  createdAt: string;
};

export default function FeedbackList({ initialFeedback }: { initialFeedback: FeedbackItem[] }) {
  const [items, setItems] = useState<FeedbackItem[]>(initialFeedback);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const markReviewed = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });
      if (!res.ok) {
        return;
      }
      const listRes = await fetch("/api/admin/feedback", { cache: "no-store" });
      if (listRes.ok) {
        const data = await listRes.json();
        setItems(data.feedback as FeedbackItem[]);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
        No feedback submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-brand-dark/5 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`border-none font-bold capitalize ${
                    item.type === "issue"
                      ? "bg-red-50 text-red-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {item.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`border-none font-bold capitalize ${
                    item.status === "reviewed"
                      ? "bg-success-light text-success"
                      : "bg-brand-dark/5 text-brand-dark/70"
                  }`}
                >
                  {item.status}
                </Badge>
                <span className="text-xs text-brand-dark/50">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-brand-dark">{item.message}</p>
              <p className="text-xs text-brand-dark/50">
                {item.email ? `Email: ${item.email}` : "Email: not provided"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {item.status === "reviewed" ? (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-success">
                  <CheckCircle className="h-4 w-4" />
                  Reviewed
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => markReviewed(item.id)}
                  disabled={updatingId === item.id}
                  className="rounded-xl"
                >
                  {updatingId === item.id ? "Updating..." : "Mark reviewed"}
                </Button>
              )}
            </div>
          </div>
          {item.status !== "reviewed" && (
            <div className="mt-4 flex items-center gap-2 text-xs text-brand-dark/50">
              <Clock className="h-3.5 w-3.5" />
              Awaiting review
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
