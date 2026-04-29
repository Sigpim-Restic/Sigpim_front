import { api } from "./client";

export const configuracoesSistemaApi = {
  getMfaForcado(): Promise<{ ativo: boolean }> {
    return api.get("/configuracoes-sistema/mfa-forcado");
  },
  setMfaForcado(ativo: boolean): Promise<{ ativo: boolean }> {
    return api.patch("/configuracoes-sistema/mfa-forcado", { ativo });
  },
};