import { api } from "./client";
import type { PerfilUsuario } from "./usuarios";

// ─── Tipos espelhando os records do backend ──────────────────────────────────

export interface PermissaoAcaoResponse {
  concedida: boolean;
  doPerfil: boolean;
  grantExtra: boolean;
  concedidaPor: string | null;
  concedidaEm: string | null;
}

export interface PermissaoModuloResponse {
  modulo: string;
  visualizar: PermissaoAcaoResponse;
  criar: PermissaoAcaoResponse;
  editar: PermissaoAcaoResponse;
  excluir: PermissaoAcaoResponse;
}

export interface PermissoesUsuarioResponse {
  idUsuario: number;
  nomeCompleto: string;
  perfil: PerfilUsuario | null;
  modulos: PermissaoModuloResponse[];
}

export interface PermissaoItem {
  modulo: string;
  acao: string;
}

export interface PermissaoUsuarioRequest {
  conceder: PermissaoItem[];
  revogar: PermissaoItem[];
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const permissoesApi = {
  buscar(idUsuario: number): Promise<PermissoesUsuarioResponse> {
    return api.get<PermissoesUsuarioResponse>(`/usuarios/${idUsuario}/permissoes`);
  },

  salvar(idUsuario: number, request: PermissaoUsuarioRequest): Promise<PermissoesUsuarioResponse> {
    return api.put<PermissoesUsuarioResponse>(`/usuarios/${idUsuario}/permissoes`, request);
  },

  resetar(idUsuario: number): Promise<PermissoesUsuarioResponse> {
    return api.delete<PermissoesUsuarioResponse>(`/usuarios/${idUsuario}/permissoes`);
  },
};