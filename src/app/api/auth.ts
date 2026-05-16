import { ApiError } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface LoginRequest {
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  idUsuario: number | null;
  email: string | null;
  nomeCompleto: string | null;
  perfil: string | null;
  perfilExtra: string | null;
  idOrgao: number | null;
  idUnidade: number | null;
  trocarSenhaNoProximoLogin: boolean;
  mfaRequired: boolean;
  mfaToken: string | null;
  // True quando admin sem MFA tenta logar com MFA forçado ativo
  mfaSetupObrigatorio: boolean;
  fotoPerfil: string | null;
  siglaOrgao: string | null;
}

export const authApi = {
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
      const msg = (body?.message as string) ?? "Credenciais inválidas.";
      throw new ApiError(res.status, msg, body);
    }

    return body as unknown as LoginResponse;
  },
};