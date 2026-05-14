import { api } from "./client";
import type { PerfilUsuario } from "./usuarios";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PermissaoAcaoResponse {
  concedida: boolean;
  /** Sempre igual a concedida no modelo por perfil. Mantido por compatibilidade. */
  doPerfil: boolean;
  /** Sempre false no modelo por perfil. Mantido por compatibilidade. */
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

/**
 * Payload de alteração de permissões de um perfil.
 * Permissões são por perfil — todos os usuários do perfil herdam automaticamente.
 */
export interface PermissaoPerfilRequest {
  conceder: PermissaoItem[];
  revogar: PermissaoItem[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const permissoesApi = {
  /** Lista permissões de todos os perfis. */
  listarPerfis(): Promise<PermissoesPerfilResponse[]> {
    return api.get<PermissoesPerfilResponse[]>("/permissoes-perfil");
  },

  /** Permissões de um perfil específico. */
  buscarPerfil(perfil: PerfilUsuario): Promise<PermissoesPerfilResponse> {
    return api.get<PermissoesPerfilResponse>(`/permissoes-perfil/${perfil}`);
  },

  /** Salva alterações de permissões para um perfil. */
  salvarPerfil(
    perfil: PerfilUsuario,
    request: PermissaoPerfilRequest
  ): Promise<PermissoesPerfilResponse> {
    return api.put<PermissoesPerfilResponse>(
      `/permissoes-perfil/${perfil}`,
      request
    );
  },
};