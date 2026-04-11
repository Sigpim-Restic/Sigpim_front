import { api } from "./client";

// --- Tipos ---

export interface OrgaoResponse {
  id: number;
  nome: string;
  sigla: string;
  codigo: string;
  ativo: boolean;
}

export interface UnidadeOrganizacionalResponse {
  id: number;
  idOrgao: number;
  nome: string;
  sigla: string;
  codigo: string;
  ativo: boolean;
}

export type PerfilUsuario =
  | "ADMINISTRADOR_SISTEMA"
  | "ADMINISTRADOR_PATRIMONIAL"
  | "CADASTRADOR_SETORIAL"
  | "VALIDADOR_DOCUMENTAL"
  | "VISTORIADOR"
  | "PLANEJAMENTO"
  | "AUDITOR";

export interface UsuarioRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  celular?: string;
  nomeUsuario: string;
  senha: string;
  matricula?: string;
  cargo?: string;
  idOrgao?: number | null;
  idUnidade?: number | null;
  perfil: PerfilUsuario;
}

export interface UsuarioResponse {
  id: number;
  nomeCompleto: string;
  email: string;
  nomeUsuario: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

// --- API ---

export const usuariosApi = {
  criar(data: UsuarioRequest): Promise<UsuarioResponse> {
    return api.post<UsuarioResponse>("/usuarios", data);
  },

  listar(): Promise<UsuarioResponse[]> {
    return api.get<UsuarioResponse[]>("/usuarios");
  },

  ativar(id: number): Promise<UsuarioResponse> {
    return api.patch<UsuarioResponse>(`/usuarios/${id}/ativar`);
  },

  desativar(id: number): Promise<UsuarioResponse> {
    return api.patch<UsuarioResponse>(`/usuarios/${id}/desativar`);
  },

  excluir(id: number): Promise<void> {
    return api.delete<void>(`/usuarios/${id}`);
  },
};

export const orgaosApi = {
  listarAtivos(): Promise<OrgaoResponse[]> {
    return api.get<OrgaoResponse[]>("/orgaos/ativos");
  },
};

export const unidadesApi = {
  listarAtivasPorOrgao(idOrgao: number): Promise<UnidadeOrganizacionalResponse[]> {
    return api.get<UnidadeOrganizacionalResponse[]>(
      `/unidades-organizacionais/orgao/${idOrgao}/ativas`
    );
  },
};