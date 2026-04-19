import { ApiError } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  idUsuario: number;
  email: string;
  nomeCompleto?: string;
  perfil?: string;
  idOrgao?: number | null;
  idUnidade?: number | null;
}

export const authApi = {
  /**
   * Login sem Authorization header.
   *
   * O api.post() genérico injeta o token do localStorage em todos os requests.
   * Isso causa 401 quando o usuário tem um token expirado e tenta logar novamente:
   * o filtro JWT rejeita o request antes de chegar ao AuthController.
   *
   * Solução: limpar o token antes de enviar e usar fetch direto sem Authorization.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Garante que nenhum token expirado seja enviado no header
    localStorage.removeItem("sigpim_token");
    localStorage.removeItem("sigpim_usuario");

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Sem Authorization header
      body: JSON.stringify(data),
    });

    const text = await res.text();
    let body: Record<string, unknown> = {};
    try { body = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

    if (!res.ok) {
      const msg = (body?.message as string) ?? "Email ou senha inválidos.";
      throw new ApiError(res.status, msg, body);
    }

    return body as unknown as LoginResponse;
  },
};