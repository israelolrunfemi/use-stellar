import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export async function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: "github-dark-default",
  });

  return (
    <div style={{ position: "relative", border: "1px solid #2a2a2a", borderRadius: 10, background: "#111111", overflow: "hidden" }}>
      <CopyButton text={code.trim()} />
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 1.75,
          overflowX: "auto",
        }}
      />
    </div>
  );
}
