import { ApiError } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  // JWT final — null quando mfaRequired = true
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  idUsuario: number | null;
  email: string | null;
  nomeCompleto: string | null;
  perfil: string | null;
  idOrgao: number | null;
  idUnidade: number | null;
  // MFA
  mfaRequired: boolean;
  mfaToken: string | null;
}

export const authApi = {
  /**
   * Login sem Authorization header.
   * Limpa token expirado antes de enviar para evitar 401 no filtro JWT.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    localStorage.removeItem("sigpim_token");
    localStorage.removeItem("sigpim_usuario");

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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