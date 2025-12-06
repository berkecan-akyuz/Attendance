const normalizedBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

const withBase = (path: string) => `${normalizedBase}${path}`;

export interface AuthPayload {
  user_id: number;
  username: string;
  role: string;
  full_name?: string;
  email?: string;
  phone?: string;
  last_login?: string | null;
}

export async function loginUser(username: string, password: string): Promise<AuthPayload> {
  const response = await fetch(withBase("/api/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to log in";
    throw new Error(message);
  }

  return payload as AuthPayload;
}

export const API_BASE_URL = normalizedBase || "(proxy)";
