import { api } from "./client";

export const configuracoesSistemaApi = {
  getMfaForcado(): Promise<{ ativo: boolean }> {
    return api.get("/configuracoes-sistema/mfa-forcado");
  },
  setMfaForcado(ativo: boolean): Promise<{ ativo: boolean }> {
    return api.patch("/configuracoes-sistema/mfa-forcado", { ativo });
  },

  getSessionExpiration(): Promise<{ minutos: number }> {
    return api.get("/configuracoes-sistema/session-expiration");
  },
  setSessionExpiration(minutos: number): Promise<{ minutos: number }> {
    return api.patch("/configuracoes-sistema/session-expiration", { minutos });
  },

  /** Lido pelo useIdleTimer no boot — disponível para qualquer usuário autenticado. */
  getSessionIdle(): Promise<{ timeoutMinutes: number; warningMinutes: number }> {
    return api.get("/configuracoes-sistema/session-idle");
  },
  setSessionIdle(
    timeoutMinutes: number,
    warningMinutes: number
  ): Promise<{ timeoutMinutes: number; warningMinutes: number }> {
    return api.patch("/configuracoes-sistema/session-idle", { timeoutMinutes, warningMinutes });
  },
};