"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MessagesApp({ appId }: { appId: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [content, setContent] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session) {
            fetchMessages();
        }
    }, [session]);

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
    const isReferrer = (session?.user as any)?.role === "referrer";
    const backLink = isReferrer ? `/dashboard` : `/dashboard`;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            <Link href={backLink} className="inline-flex items-center text-sm font-semibold text-brand-dark/60 hover:text-primary mb-4 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>

            <Card className="flex-1 border-brand-dark/10 shadow-sm flex flex-col overflow-hidden bg-white">
                <div className="p-4 border-b border-brand-dark/5 bg-brand-dark/5 font-bold text-brand-dark">
                    Conversation
                </div>

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
            </Card>
        </div>
    );
}
