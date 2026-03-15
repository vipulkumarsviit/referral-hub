"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Paperclip, MoreVertical, FileText, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    meta?: { initials?: string; name?: string; preview?: string; isSeeker?: boolean; company?: string; position?: string };
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
        seekerName?: string | null;
        seekerPosition?: string | null;
        role?: "referrer" | "seeker";
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
                    seekerName: data.seekerName,
                    seekerPosition: data.seekerPosition,
                    role: data.role,
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
        return <div className="flex-1 flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-[#506ef7]" /></div>;
    }

    const currentUserId = session?.user?.id;

    // Determine the "other person" in the conversation
    const otherPersonName = appDetails?.role === "referrer" ? appDetails?.seekerName : appDetails?.referrerName;
    const otherPersonRole = appDetails?.role === "referrer" ? "Job Seeker" : "Referrer";

    // Calculate initials for the avatar if they aren't provided by the `meta` prop
    const calculatedInitials = String(otherPersonName || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

    const effectiveMeta =
        meta || appDetails
            ? {
                ...(meta || {}),
                ...(appDetails && {
                    company: appDetails.company,
                    position: appDetails.position,
                    initials: calculatedInitials,
                    name: otherPersonName || "User",
                }),
            }
            : undefined;

    const isCurrentUserSeeker = meta ? meta.isSeeker : appDetails?.role === "seeker";

    const threadCard = (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            {effectiveMeta && (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                            <AvatarFallback className="bg-indigo-50 text-[#506ef7] font-bold text-lg">
                                {effectiveMeta.initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 truncate">
                                    {effectiveMeta.name}
                                </h2>
                                {!isCurrentUserSeeker && (
                                    <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-full truncate">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                                {isCurrentUserSeeker ? (
                                    <span>Referrer at {effectiveMeta.company} • google.com/careers</span>
                                ) : (
                                    <>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span>{effectiveMeta.position} @ {effectiveMeta.company}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isCurrentUserSeeker ? (
                            <>
                                <Button variant="ghost" className="text-slate-500 hover:text-slate-700 font-medium h-9">
                                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                                    View Job
                                </Button>
                                <Button className="bg-[#506ef7] hover:bg-indigo-600 font-medium h-9 shadow-sm px-4">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Call
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="border-slate-200 text-slate-600 font-medium h-9 shadow-sm hover:bg-slate-50">
                                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                                    Resume
                                </Button>
                                <Button className="bg-[#506ef7] hover:bg-indigo-600 text-white font-medium h-9 shadow-sm px-4">
                                    Refer Candidate
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 ml-1">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/50">
                <div className="flex justify-center mb-8">
                    <span className="bg-slate-200/50 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full">
                        This is the start of your conversation
                    </span>
                </div>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-12">
                        <p className="text-sm font-medium">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = m.senderId.toString() === currentUserId;
                        return (
                            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`relative max-w-[75%] px-5 py-3 text-[15px] leading-relaxed shadow-sm ${isMe
                                        ? "bg-[#506ef7] text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm"
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={sendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-slate-600 rounded-full h-11 w-11 mt-auto">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="relative flex-1">
                        <Input
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full min-h-[44px] py-3 px-4 bg-slate-100 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#506ef7] rounded-xl text-[15px] leading-relaxed resize-none shadow-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={sending || !content.trim()}
                        className="shrink-0 rounded-full h-11 w-11 bg-[#506ef7] hover:bg-indigo-600 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 ml-0.5" />}
                    </Button>
                </form>
            </div>
        </div>
    );

    if (embedded) {
        return <div className="h-full flex flex-col relative w-full overflow-hidden">{threadCard}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col shadow-sm border-x border-slate-200">
            {threadCard}
        </div>
    );
}
