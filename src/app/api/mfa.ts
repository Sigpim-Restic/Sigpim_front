import { api } from "./client";
import type { LoginResponse } from "./auth";

export interface MfaSetupResponse {
  qrCodeUri: string;
  secretKey: string;
}

export const mfaApi = {
  /** Inicia configuração — retorna QR Code URI e chave secreta. */
  setup(): Promise<MfaSetupResponse> {
    return api.post("/auth/mfa/setup");
  },

  /** Confirma ativação com o primeiro código válido do app. */
  confirmar(codigo: string): Promise<void> {
    return api.post("/auth/mfa/confirmar", { codigo });
  },

  /** Segunda etapa do login — valida token temporário + código TOTP. */
  verificar(mfaToken: string, codigo: string): Promise<LoginResponse> {
    return api.post("/auth/mfa/verificar", { mfaToken, codigo });
  },

  // REMOVIDO: desativar() — política da organização proíbe desativação self-service.
  // Reset de MFA é feito pelo ADMINISTRADOR_SISTEMA via DELETE /usuarios/{id}/mfa.
};