"use client";

import { useEffect, useMemo, useState } from "react";
import MessagesApp from "../../messages/[id]/MessagesApp";
import { Input } from "@/components/ui/input";

type Item = {
  appId: string;
  name: string;
  initials: string;
  preview: string;
};

export default function ConversationsSplit({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!selected && items.length > 0) {
      setSelected(items[0].appId);
    }
  }, [items, selected]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.preview.toLowerCase().includes(q)
    );
  }, [items, query]);

  const selectedMeta = useMemo(
    () => filtered.find((i) => i.appId === selected) || items.find((i) => i.appId === selected) || null,
    [filtered, items, selected]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] overflow-hidden border border-brand-dark/10 rounded-xl bg-white">
      <div className="border-b lg:border-b-0 lg:border-r border-brand-dark/10 bg-white">
        <div className="p-4 border-b border-brand-dark/10">
          <div className="font-bold text-brand-dark mb-3">Messages</div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-10 bg-brand-dark/5 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-brand-dark/50">
              No conversations yet.
            </div>
          ) : (
            <ul className="flex flex-col">
              {filtered.map((it) => {
                const active = selected === it.appId;
                return (
                  <li key={it.appId}>
                    <button
                      onClick={() => setSelected(it.appId)}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left border-b border-transparent ${active
                          ? "bg-primary/5 border-l-4 border-l-primary"
                          : "hover:bg-brand-dark/5"
                        }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {it.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-brand-dark truncate">
                          {it.name}
                        </div>
                        <div className="text-xs text-brand-dark/60 truncate">
                          {it.preview}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="border-b lg:border-b-0 lg:border-r border-brand-dark/10 bg-white">
        <div className="h-[70vh] p-2 flex flex-col">
          {selected ? (
            <MessagesApp
              appId={selected}
              embedded
              meta={{
                initials: selectedMeta?.initials,
                name: selectedMeta?.name,
                preview: selectedMeta?.preview,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-brand-dark/60">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
