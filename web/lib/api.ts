const BASE = process.env.NEXT_PUBLIC_API ?? "http://127.0.0.1:8000";

// Staff token. In the real app this comes from the session.
const TOKEN = "tok-coach-akanksha";

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "x-staff-token": TOKEN, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export async function searchMembers(q: string) {
  const body = await request(`/api/members?q=${encodeURIComponent(q)}`);
  return body.results;
}

export async function getMember(memberId: string) {
  return request(`/api/members/${memberId}`);
}

export async function setStatus(memberId: string, status: string) {
  return request(`/api/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ member_id: memberId, status }),
  });
}

export async function addNote(memberId: string, body: string) {
  return request(`/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ member_id: memberId, body }),
  });
}
