"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MessagesApp({
    appId,
    embedded = false,
    title,
    subtitle,
    meta,
}: {
    appId: string;
    embedded?: boolean;
    title?: string;
    subtitle?: string;
    meta?: { initials?: string; name?: string; preview?: string };
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [content, setContent] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const [appDetails, setAppDetails] = useState<{
        position: string;
        company: string;
        referrerName?: string | null;
        referrerPosition?: string | null;
    } | null>(null);

    useEffect(() => {
        if (session) {
            fetchMessages();
        }
    }, [session, appId]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch(`/api/applications/meta/${appId}`);
                if (!res.ok) return;
                const data = await res.json();
                setAppDetails({
                    position: data.position,
                    company: data.company,
                    referrerName: data.referrerName,
                    referrerPosition: data.referrerPosition,
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchMeta();
    }, [appId]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages/${appId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            } else if (res.status === 401) {
                router.push("/login");
            } else {
                console.error("Failed to fetch");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/messages/${appId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message]);
                setContent("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    const currentUserId = session?.user?.id;
    const effectiveMeta =
        meta || appDetails
            ? {
                  ...meta,
                  ...(appDetails && {
                      initials: appDetails.position,
                      name: appDetails.company,
                  }),
              }
            : undefined;
    const threadCard = (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            { effectiveMeta && (
                <div className="p-4 border-b border-brand-dark/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {appDetails?.company?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-brand-dark truncate">
                                    {appDetails?.position || "Select a conversation"}
                                </p>
                                <span className="text-xs font-medium text-brand-dark/50 truncate">
                                    @{appDetails?.company || ""}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-brand-dark/60">
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                                <span className="uppercase tracking-wide">
                                    Referral Submitted • Active
                                </span>
                            </div>
                        </div>
                    </div>
                    {appDetails?.referrerName && (
                        <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-xs font-semibold text-brand-dark">
                                {appDetails.referrerName}
                            </span>
                            <span className="text-[11px] font-medium text-primary">
                                {appDetails.referrerPosition || "Your Referrer"}
                            </span>
                        </div>
                    )}
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/50">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-brand-dark/40">
                            No messages yet. Say hello!
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = m.senderId.toString() === currentUserId;
                            return (
                                <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-brand-dark/10 text-brand-dark rounded-bl-sm"}`}>
                                        {m.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
            </div>
            <div className="p-4 bg-white border-t border-brand-dark/5">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-12 bg-brand-dark/5 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Button type="submit" disabled={sending || !content.trim()} className="h-12 w-12 rounded-xl bg-primary text-white">
                        {sending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 ml-1" />}
                    </Button>
                </form>
            </div>
        </div>
    );

    if (embedded) {
        return <div className="h-full flex flex-col">{threadCard}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            {threadCard}
        </div>
    );
}
