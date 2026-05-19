const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function kakaoLogin(code: string, benefit: string, answers: unknown[]) {
  return request<{ ok: true }>('/api/auth/kakao/callback', {
    method: 'POST',
    body: JSON.stringify({ code, benefit, answers }),
  });
}

export function getMe() {
  return request<{ id: string; nickname: string; points: number } | null>('/api/me').catch(() => null);
}

export function submitSampleRequest(data: {
  name: string;
  phone: string;
  address: string;
  addressSub?: string;
  zipcode: string;
}) {
  return request<{ ok: true; requestId: string }>('/api/sample-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function logout() {
  return request<{ ok: true }>('/api/auth/logout', { method: 'POST' });
}
