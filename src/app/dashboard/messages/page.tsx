import ConversationsSplit from "./ConversationsSplit";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function MessagesIndex() {
    const session = await auth();
    if (!session || !session.user) redirect("/login");

    const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
        throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/dashboard/messages/overview`, {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to load conversations");
    }

    const { items } = await res.json();
    const role = (session.user as any).role as "seeker" | "referrer";

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-brand-dark">Messages</h1>
                <p className="mt-2 text-brand-dark/60">
                    Conversations with your {role === "referrer" ? "applicants" : "referrers"}.
                </p>
            </div>
            <ConversationsSplit items={items} />
        </div>
    );
}
