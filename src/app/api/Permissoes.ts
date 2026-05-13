import { api } from "./client";
import type { PerfilUsuario } from "./usuarios";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PermissaoAcaoResponse {
  concedida: boolean;
  doPerfil: boolean;   // mantido para compatibilidade — sempre igual a concedida no novo modelo
  grantExtra: boolean; // sempre false no novo modelo
  concedidaPor: string | null;
  concedidaEm: string | null;
}

export interface PermissaoModuloResponse {
  modulo: string;
  visualizar: PermissaoAcaoResponse;
  criar: PermissaoAcaoResponse;
  editar: PermissaoAcaoResponse;
  excluir: PermissaoAcaoResponse;
  validar: PermissaoAcaoResponse;
}

export interface PermissoesPerfilResponse {
  perfil: PerfilUsuario;
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

// ── API ───────────────────────────────────────────────────────────────────────

export const permissoesApi = {
  /** Lista permissões de todos os perfis */
  listarPerfis(): Promise<PermissoesPerfilResponse[]> {
    return api.get<PermissoesPerfilResponse[]>("/permissoes-perfil");
  },

  /** Permissões de um perfil específico */
  buscarPerfil(perfil: PerfilUsuario): Promise<PermissoesPerfilResponse> {
    return api.get<PermissoesPerfilResponse>(`/permissoes-perfil/${perfil}`);
  },

  /** Salva alterações para um perfil */
  salvarPerfil(perfil: PerfilUsuario, request: PermissaoUsuarioRequest): Promise<PermissoesPerfilResponse> {
    return api.put<PermissoesPerfilResponse>(`/permissoes-perfil/${perfil}`, request);
  },
};