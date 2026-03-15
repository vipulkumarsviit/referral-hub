import MessagesLayout from "./MessagesLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

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

    const { seekerApplications, referrerJobs } = await res.json();

    return (
        <div className="h-[calc(100vh-80px)] mt-[-24px] mx-[-24px]">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
                <MessagesLayout 
                    seekerApplications={seekerApplications || []} 
                    referrerJobs={referrerJobs || []} 
                />
            </Suspense>
        </div>
    );
}
