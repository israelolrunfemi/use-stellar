import type { CSSProperties } from "react";
import Link from "next/link";
import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export async function HookCard({ name, description, snippet, href }: { name: string; description: string; snippet: string; href: string }) {
  const html = await codeToHtml(snippet.trim(), {
    lang: "tsx",
    theme: "github-dark-default",
  });

  return (
    <article style={card}>
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: 15, marginBottom: 10 }}>{name}</div>
        <p style={{ margin: "0 0 16px", color: "#a8a8a8", fontSize: 14, lineHeight: 1.55 }}>{description}</p>
      </Link>
      <div style={snippetFrame}>
        <CopyButton text={snippet.trim()} />
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.55, overflowX: "auto" }}
        />
      </div>
    </article>
  );
}

const card: CSSProperties = {
  minHeight: 184,
  padding: 18,
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  color: "inherit",
};

const snippetFrame: CSSProperties = {
  position: "relative",
  background: "#111111",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  overflow: "hidden",
};