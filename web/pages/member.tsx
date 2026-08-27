import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getMember, setStatus, addNote } from "../lib/api";
import StatusChip from "../components/StatusChip";

const PROGRAMME_BLURB: Record<string, string> = {
  "Knee rehabilitation":
    "Knee pain can make climbing stairs difficult. Our knee programme is designed by clinicians to get you moving comfortably again, on your own schedule.",
  "Lower back":
    "Back pain shouldn't hold you back. Gentle daily movement builds the strength that keeps you doing what you love.",
  "Knee + ankle":
    "Recovery takes time, and we're with you at every step. Small daily wins add up.",
};

export default function MemberView() {
  const router = useRouter();
  const { id } = router.query;

  const [member, setMember] = useState<any>(null);
  const [status, setLocalStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMember(id as string).then((m) => {
      setMember(m);
      setLocalStatus(m.status);
    });
  }, [id]);

  const onStatusChange = async (next: string) => {
    const prev = status;
    setLocalStatus(next);
    setError("");
    try {
      await setStatus(id as string, next);
    } catch {
      setLocalStatus(prev);
      setError("Status change didn't save — try again.");
    }
  };

  const onSaveNote = async () => {
    const body = note.trim();
    if (!body) return;
    setError("");
    try {
      const updated = await addNote(id as string, body);
      setMember(updated);
      setNote("");
    } catch {
      setError("Note didn't save — your text is still below.");
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", padding: 32, maxWidth: 900 }}>
      <a href="/" style={{ fontSize: 14 }}>&larr; Back to members</a>

      <h1 style={{ fontSize: 26, marginTop: 16 }}>
        {member ? `${member.first_name} ${member.last_name}` : "…"}
      </h1>

      <p style={{ color: "#667085", fontSize: 15 }}>
        {PROGRAMME_BLURB[member?.programme] ?? ""}
      </p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 17 }}>Programme</h2>
        <p>
          {member?.programme} &middot; phase {member?.phase} &middot; session{" "}
          {member?.session} of {member?.sessions_total}
        </p>
        <p>Last reported pain: {member?.last_pain_score} / 10</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 17 }}>Outreach status</h2>
        <p>
          <StatusChip status={status} />{" "}
          <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="ontrack">ontrack</option>
            <option value="attention">attention</option>
            <option value="overdue">overdue</option>
            <option value="closed">closed</option>
          </select>
        </p>
        <p style={{ fontSize: 14, color: "#667085" }}>
          Last contact: {member?.last_contact}
        </p>
        {error && (
          <p style={{ fontSize: 14, color: "#B42318" }}>{error}</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 17 }}>Notes</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {member?.notes}
        </pre>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 8, fontFamily: "inherit" }}
          placeholder="Add a note"
        />
        <button onClick={onSaveNote} style={{ marginTop: 8, padding: "6px 14px" }}>
          Save note
        </button>
      </section>

      <section style={{ marginTop: 32 }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: "none", border: "none", color: "#1849A9", padding: 0 }}
        >
          {showDetails ? "Hide" : "Show"} member details
        </button>

        {showDetails && (
          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
            <div>Date of birth: {member?.dob}</div>
            <div>Sex: {member?.sex}</div>
            <div>MRN: {member?.mrn}</div>
            <div>Diagnosis: {member?.diagnosis}</div>
            <div>Allergies: {member?.allergies?.join(", ") || "none recorded"}</div>
            <div>Phone: {member?.phone}</div>
            <div>Email: {member?.email}</div>
          </div>
        )}
      </section>
    </main>
  );
}
