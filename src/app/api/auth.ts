import { api } from "./client";

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
  login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/auth/login", data);
  },
};
