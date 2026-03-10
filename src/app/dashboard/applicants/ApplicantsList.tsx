"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Bookmark, X, Search } from "lucide-react";
import ApplicantActions from "../listings/[id]/ApplicantActions";

type ApplicantItem = {
    _id: string;
    status: string;
    resumeUrl?: string;
    createdAt: Date;
    user: {
        name: string;
        jobTitle: string;
        image?: string;
        skills?: string[];
    };
};

export default function ApplicantsList({ items }: { items: ApplicantItem[] }) {
    type TabKey = "All" | "Saved" | "Accepted" | "Declined";
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<TabKey>("All");
    const [page, setPage] = useState(1);
    const pageSize = 4;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = items;
        if (tab === "Saved") {
            list = list.filter((i) => i.status === "Viewed");
        } else if (tab === "Accepted") {
            list = list.filter((i) => i.status === "Accepted");
        } else if (tab === "Declined") {
            list = list.filter((i) => i.status === "Declined");
        }
        if (q) {
            list = list.filter((i) => {
                const hay = [
                    i.user.name,
                    i.user.jobTitle,
                    ...(i.user.skills || []),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            });
        }
        return list;
    }, [items, query, tab]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

    const counts = useMemo(() => {
        return {
            all: items.length,
            saved: items.filter((i) => i.status === "Viewed").length,
            accepted: items.filter((i) => i.status === "Accepted").length,
            declined: items.filter((i) => i.status === "Declined").length,
        };
    }, [items]);

    return (
        <div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by name or skills..."
                        className="h-12 rounded-xl border-brand-dark/10 bg-white pl-12 text-base shadow-sm placeholder:text-brand-dark/40 focus-visible:ring-primary"
                    />
                </div>
            </div>

            <div className="mb-6 flex items-center gap-6 border-b border-brand-dark/10">
                {([
                    { label: "All Applicants", key: "All", count: counts.all },
                    { label: "Saved", key: "Saved", count: counts.saved },
                    { label: "Accepted", key: "Accepted", count: counts.accepted },
                    { label: "Declined", key: "Declined", count: counts.declined },
                ] as Array<{ label: string; key: TabKey; count: number }>).map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => {
                                setTab(t.key);
                                setPage(1);
                            }}
                            className={`relative pb-3 text-sm font-semibold transition-colors ${
                                active ? "text-brand-dark" : "text-brand-dark/60 hover:text-brand-dark"
                            }`}
                        >
                            {t.label}
                            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-dark/5 px-2 text-xs font-bold text-brand-dark/60">
                                {t.count}
                            </span>
                            {active && (
                                <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {pageItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
                    No applicants found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pageItems.map((item) => {
                        const initials = item.user.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase())
                            .join("");
                        return (
                            <Card key={item._id} className="border-brand-dark/10 shadow-sm">
                                <CardContent className="flex items-center justify-between gap-4 p-5">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                                {initials || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-base font-extrabold text-brand-dark">
                                                    {item.user.name}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium text-brand-dark/80">
                                                {item.user.jobTitle}
                                            </p>
                                            {item.user.skills && item.user.skills.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.user.skills.slice(0, 4).map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {item.resumeUrl && (
                                            <Link
                                                href={item.resumeUrl}
                                                target="_blank"
                                                className="text-sm font-semibold text-primary hover:underline"
                                            >
                                                View Resume
                                            </Link>
                                        )}
                                        <button
                                            title="Save"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-dark/50 hover:bg-brand-dark/5 hover:text-brand-dark/80"
                                            aria-label="Save"
                                        >
                                            <Bookmark className="h-5 w-5" />
                                        </button>
                                        <button
                                            title="Remove"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-dark/50 hover:bg-brand-dark/5 hover:text-brand-dark/80"
                                            aria-label="Remove"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                        <ApplicantActions applicationId={item._id} currentStatus={item.status} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    ‹
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                    const n = idx + 1;
                    const active = n === page;
                    return (
                        <Button
                            key={n}
                            variant={active ? "default" : "outline"}
                            onClick={() => setPage(n)}
                            className={`h-9 w-9 p-0 ${active ? "font-bold" : ""}`}
                        >
                            {n}
                        </Button>
                    );
                })}
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    ›
                </Button>
            </div>
        </div>
    );
}
