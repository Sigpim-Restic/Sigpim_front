import { api } from "./client";

export const configuracoesSistemaApi = {
  getMfaForcadoAdministradores(): Promise<{ ativo: boolean }> {
    return api.get("/configuracoes-sistema/mfa-forcado-administradores");
  },
  setMfaForcadoAdministradores(ativo: boolean): Promise<{ ativo: boolean }> {
    return api.patch("/configuracoes-sistema/mfa-forcado-administradores", { ativo });
  },
};