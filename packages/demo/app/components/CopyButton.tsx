"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        height: 30,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid #2a2a2a",
        background: copied ? "#153321" : "#1a1a1a",
        color: copied ? "#4ade80" : "#f0f0f0",
        fontSize: 12,
        fontFamily: "monospace",
        cursor: "pointer",
      }}
    >
      {copied ? "✓" : label}
    </button>
  );
}
