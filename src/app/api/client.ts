/**
 * Cliente HTTP central do SIGPIM.
 *
 * - BASE_URL vem de VITE_API_URL (definido no .env / docker-compose)
 * - Injeta JWT em todos os requests autenticados
 * - Trata 401 automaticamente → redireciona para /login
 * - Lança ApiError com a mensagem do back-end para o front exibir
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("sigpim_token");
}

function buildHeaders(isMultipart = false): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Na tela de login, o 401 é credencial inválida — não redireciona
    if (res.url && res.url.includes("/auth/login")) {
      const text2 = await res.text();
      let msg = "Email ou senha inválidos.";
      try { msg = JSON.parse(text2)?.message ?? msg; } catch { /* ignore */ }
      throw new ApiError(401, msg);
    }
    localStorage.removeItem("sigpim_token");
    localStorage.removeItem("sigpim_usuario");
    window.location.href = "/login";
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data as Record<string, string>)?.message ??
      (data as Record<string, string>)?.erro ??
      `Erro ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(),
    }).then((r) => handleResponse<T>(r));
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },

  delete<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    }).then((r) => handleResponse<T>(r));
  },

  /** Upload multipart — não seta Content-Type, o browser define o boundary */
  upload<T>(path: string, formData: FormData): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(true),
      body: formData,
    }).then((r) => handleResponse<T>(r));
  },

  /**
   * Download — returns a Blob for saving or opening in the browser.
   *
   * Handles 302 redirects from the backend (e.g. Supabase signed URLs):
   * fetches the redirect target URL directly without the Authorization header,
   * since Supabase signed URLs are self-authenticating.
   */
  download(path: string): Promise<Blob> {
    return fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(),
      redirect: "manual",  // intercept redirect instead of following it
    }).then(async (r) => {
      // 302/301 redirect → follow to the signed URL without auth header
      if (r.type === "opaqueredirect" || r.status === 302 || r.status === 301) {
        const location = r.headers.get("Location");
        if (location) {
          const redirectRes = await fetch(location, { method: "GET" });
          if (!redirectRes.ok) throw new ApiError(redirectRes.status, `Download falhou: ${redirectRes.status}`);
          return redirectRes.blob();
        }
      }
      if (!r.ok) throw new ApiError(r.status, `Download falhou: ${r.status}`);
      return r.blob();
    });
  },
};