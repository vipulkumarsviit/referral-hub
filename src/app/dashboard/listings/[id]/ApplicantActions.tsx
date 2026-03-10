"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApplicantActions({
    applicationId,
    currentStatus
}: {
    applicationId: string,
    currentStatus: string
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const updateStatus = async (status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === "Accepted") {
        return (
            <Button
                onClick={() => router.push(`/messages/${applicationId}`)}
                className="h-10 px-6 font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
                Message
            </Button>
        );
    }

    if (currentStatus === "Declined") {
        return <span className="text-sm font-medium text-brand-dark/40 px-4">Declined</span>;
    }

    return (
        <div className="flex gap-2">
            <Button
                onClick={() => updateStatus("Declined")}
                variant="outline"
                disabled={loading}
                className="h-10 px-4 text-brand-dark/60 border-brand-dark/10 hover:bg-brand-dark/5"
            >
                Decline
            </Button>
            <Button
                onClick={() => updateStatus("Accepted")}
                disabled={loading}
                className="h-10 px-6 font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
            </Button>
        </div>
    );
}
