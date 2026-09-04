"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { BLOCK_CATALOG, CATEGORY_LABELS } from "@/lib/blocks";
import { BlockItem } from "@/components/builder/BlockItem";
import type { NodeCategory } from "@/types";

const CATEGORY_ORDER: NodeCategory[] = ["data", "prep", "model", "eval"];

export function Sidebar() {
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const plan = session?.user?.plan ?? "FREE";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BLOCK_CATALOG;
    return BLOCK_CATALOG.filter(
      (b) => b.label.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <aside className="w-[200px] shrink-0 border-r border-border bg-surface flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
          Блоки
        </h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск блоков…"
          className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {CATEGORY_ORDER.map((category) => {
          const blocks = filtered.filter((b) => b.category === category);
          if (blocks.length === 0) return null;

          return (
            <div key={category} className="mb-3">
              <div className="text-[10px] font-mono uppercase tracking-wide text-text-muted px-2 mb-1">
                {CATEGORY_LABELS[category]}
              </div>
              {blocks.map((block) => (
                <BlockItem
                  key={block.type}
                  block={block}
                  locked={block.pro && plan === "FREE"}
                />
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
