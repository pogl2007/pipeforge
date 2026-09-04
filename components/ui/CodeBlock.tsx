"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative bg-bg border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
        <span className="text-xs font-mono text-text-secondary">{language}</span>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? "Скопировано ✓" : "Копировать"}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed font-mono text-text-primary scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}
