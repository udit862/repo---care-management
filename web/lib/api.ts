const BASE = process.env.NEXT_PUBLIC_API ?? "http://127.0.0.1:8000";

// Staff token. In the real app this comes from the session.
const TOKEN = "tok-coach-akanksha";

export async function searchMembers(q: string) {
  const res = await fetch(`${BASE}/api/members?q=${encodeURIComponent(q)}`, {
    headers: { "x-staff-token": TOKEN },
  });
  const body = await res.json();
  return body.results;
}

export async function getMember(memberId: string) {
  const res = await fetch(`${BASE}/api/members/${memberId}`, {
    headers: { "x-staff-token": TOKEN },
  });
  return res.json();
}

export async function setStatus(memberId: string, status: string) {
  return fetch(`${BASE}/api/status`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-staff-token": TOKEN },
    body: JSON.stringify({ member_id: memberId, status }),
  });
}

export async function addNote(memberId: string, body: string) {
  return fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-staff-token": TOKEN },
    body: JSON.stringify({ member_id: memberId, body }),
  });
}
