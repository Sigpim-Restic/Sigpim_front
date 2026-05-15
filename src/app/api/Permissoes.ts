import { api } from "./client";
import type { PerfilUsuario } from "./usuarios";

// ── Tipos ─────────────────────────────────────────────────────────────────────

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
  validar: PermissaoAcaoResponse;
}

export interface PermissoesPerfilResponse {
  /** Perfil base do enum. */
  perfil: PerfilUsuario;
  /** Chave efetiva — igual a perfil.name() para padrões, ou chave customizada. */
  chave: string;
  /** Nome amigável — null para perfis padrão. */
  nome: string | null;
  /** Descrição — null para perfis padrão. */
  descricao: string | null;
  /** True se for um perfil customizado. */
  customizado: boolean;
  modulos: PermissaoModuloResponse[];
}

export interface PermissaoItem {
  modulo: string;
  acao: string;
}

export interface PermissaoPerfilRequest {
  conceder: PermissaoItem[];
  revogar: PermissaoItem[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const permissoesApi = {
  /** Lista permissões de todos os perfis (padrão + customizados ativos). */
  listarPerfis(): Promise<PermissoesPerfilResponse[]> {
    return api.get<PermissoesPerfilResponse[]>("/permissoes-perfil");
  },

  /** Permissões de um perfil padrão específico. */
  buscarPerfil(perfil: PerfilUsuario): Promise<PermissoesPerfilResponse> {
    return api.get<PermissoesPerfilResponse>(`/permissoes-perfil/${perfil}`);
  },

  /** Permissões de um perfil customizado pela chave. */
  buscarPerfilCustomizado(chave: string): Promise<PermissoesPerfilResponse> {
    return api.get<PermissoesPerfilResponse>(`/permissoes-perfil/customizado/${chave}`);
  },

  /** Salva alterações de permissões para um perfil padrão. */
  salvarPerfil(
    perfil: PerfilUsuario,
    request: PermissaoPerfilRequest
  ): Promise<PermissoesPerfilResponse> {
    return api.put<PermissoesPerfilResponse>(
      `/permissoes-perfil/${perfil}`,
      request
    );
  },

  /** Salva alterações de permissões para um perfil customizado. */
  salvarPerfilCustomizado(
    chave: string,
    request: PermissaoPerfilRequest
  ): Promise<PermissoesPerfilResponse> {
    return api.put<PermissoesPerfilResponse>(
      `/permissoes-perfil/customizado/${chave}`,
      request
    );
  },
};