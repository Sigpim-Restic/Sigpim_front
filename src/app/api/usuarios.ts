import { api } from "./client";

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
  // Optional — admin assigns later via PATCH /usuarios/{id}/perfil
  perfil?: PerfilUsuario;
}

export interface UsuarioResponse {
  id: number;
  nomeCompleto: string;
  cpf: string | null;
  email: string;
  celular: string | null;
  nomeUsuario: string;
  matricula: string | null;
  cargo: string | null;
  idOrgao: number | null;
  idUnidade: number | null;
  // Null until admin assigns a role
  perfil: PerfilUsuario | null;
  ativo: boolean;
  criadoEm: string | null;
  atualizadoEm: string | null;
}

export const usuariosApi = {
  criar(data: UsuarioRequest): Promise<UsuarioResponse> {
    return api.post<UsuarioResponse>("/usuarios", data);
  },
  listar(): Promise<UsuarioResponse[]> {
    return api.get<UsuarioResponse[]>("/usuarios");
  },
  listarInativos(): Promise<UsuarioResponse[]> {
    return api.get<UsuarioResponse[]>("/usuarios/inativos");
  },
  buscarPorId(id: number): Promise<UsuarioResponse> {
    return api.get<UsuarioResponse>(`/usuarios/${id}`);
  },
  buscarMe(): Promise<UsuarioResponse> {
    return api.get<UsuarioResponse>("/usuarios/me");
  },
  definirPerfil(id: number, perfil: PerfilUsuario): Promise<UsuarioResponse> {
    return api.patch<UsuarioResponse>(`/usuarios/${id}/perfil`, { perfil });
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
  alterarMinhaSenha(novaSenha: string): Promise<void> {
    return api.patch<void>("/usuarios/minha-senha", { novaSenha });
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