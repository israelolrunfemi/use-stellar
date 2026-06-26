import type { CSSProperties } from "react";
export function ApiTable({ rows }: { rows: { name: string; type: string; default?: string; description: string }[] }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #2a2a2a", borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620, fontSize: 14 }}>
        <thead style={{ background: "#1a1a1a" }}>
          <tr>{["Name", "Type", "Default", "Description"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.name}>
              <td style={td}><code style={code}>{row.name}</code></td>
              <td style={td}><code style={code}>{row.type}</code></td>
              <td style={td}>{row.default ? <code style={code}>{row.default}</code> : "-"}</td>
              <td style={td}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: CSSProperties = { textAlign: "left", padding: "12px 14px", color: "#f0f0f0", borderBottom: "1px solid #2a2a2a" };
const td: CSSProperties = { padding: "12px 14px", color: "#a8a8a8", borderTop: "1px solid #2a2a2a", verticalAlign: "top" };
const code: CSSProperties = { color: "#7dd3fc", fontFamily: "monospace" };

