import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import FeedbackList from "./FeedbackList";

export default async function AdminFeedbackPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: "user" | "admin" })?.role;
  if (role !== "admin") {
    redirect("/dashboard");
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/admin/feedback`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load feedback");
  }

  const { feedback } = await res.json();

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-brand-dark">Feedback Inbox</h1>
        <p className="mt-2 text-brand-dark/60">
          Review issues and feature requests submitted by users.
        </p>
      </div>

      <FeedbackList initialFeedback={feedback} />
    </div>
  );
}
