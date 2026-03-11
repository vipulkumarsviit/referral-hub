"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ApplyButton({ jobId }: { jobId: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [needsProfile, setNeedsProfile] = useState(false);

    const handleApply = async () => {
        if (!session) {
            router.push("/login");
            return;
        }

        if ((session.user as any).role !== "seeker") {
            setError("Must be a job seeker to apply.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data.message || "Failed to apply";
                if (res.status === 400 && typeof msg === "string" && msg.toLowerCase().includes("resume link")) {
                    setNeedsProfile(true);
                }
                throw new Error(msg);
            }

            setMessage("Application sent successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
            {error && <p className="text-red-300 text-sm font-medium bg-red-950/50 px-3 py-1.5 rounded-lg">{error}</p>}
            {needsProfile && (
                <Button
                    onClick={() => router.push("/dashboard/settings?missing=resume")}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto font-semibold"
                >
                    Complete Profile
                </Button>
            )}
            {message ? (
                <div className="flex items-center gap-2 text-success font-bold bg-success-light px-6 py-3 rounded-xl">
                    <Sparkles className="h-5 w-5" />
                    {message}
                </div>
            ) : (
                <Button
                    onClick={handleApply}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 text-base font-bold rounded-xl shadow-xl shadow-primary/25 bg-primary text-white hover:bg-primary/90 transition-all"
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Request Referral"}
                </Button>
            )}
        </div>
    );
}
