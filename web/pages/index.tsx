import { useEffect, useState } from "react";
import Link from "next/link";
import { searchMembers } from "../lib/api";
import StatusChip from "../components/StatusChip";

export default function MemberSearch() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    searchMembers(q)
      .then((results) => {
        setRows(results);
        setError("");
      })
      .catch(() => {
        setRows([]);
        setError("Couldn't reach the server.");
      });
  }, [q]);

  return (
    <main style={{ fontFamily: "system-ui", padding: 32, maxWidth: 1100 }}>
      <h1 style={{ fontSize: 24 }}>Members</h1>

      <input
        placeholder="Search by name or member ID"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ padding: 8, width: 320, fontSize: 15, marginBottom: 20 }}
      />

      {error && (
        <p style={{ fontSize: 14, color: "#B42318" }}>{error}</p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th style={{ padding: 8 }}>First name</th>
            <th style={{ padding: 8 }}>Last name</th>
            <th style={{ padding: 8 }}>Programme</th>
            <th style={{ padding: 8 }}>Coach</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.member_id} style={{ borderBottom: "1px solid #f2f2f2" }}>
              <td style={{ padding: 8 }}>
                <Link href={`/member?id=${m.member_id}`}>{m.first_name}</Link>
              </td>
              <td style={{ padding: 8 }}>{m.last_name}</td>
              <td style={{ padding: 8 }}>{m.programme}</td>
              <td style={{ padding: 8 }}>{m.coach}</td>
              <td style={{ padding: 8 }}>
                <StatusChip status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
