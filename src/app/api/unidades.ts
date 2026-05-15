import { api } from "./client";

export interface UnidadeOrganizacionalResponse {
  id: number;
  idOrgao: number;
  nome: string;
  sigla: string | null;
  codigo: string | null;
  ativo: boolean;
}

export interface UnidadeOrganizacionalRequest {
  idOrgao: number;
  nome: string;
  sigla?: string;
  codigo?: string;
}

export const unidadesApi = {
  listarAtivasPorOrgao(idOrgao: number): Promise<UnidadeOrganizacionalResponse[]> {
    return api.get<UnidadeOrganizacionalResponse[]>(
      `/unidades-organizacionais/orgao/${idOrgao}/ativas`
    );
  },

  listarPorOrgao(idOrgao: number): Promise<UnidadeOrganizacionalResponse[]> {
    return api.get<UnidadeOrganizacionalResponse[]>(
      `/unidades-organizacionais/orgao/${idOrgao}`
    );
  },

  listarTodas(): Promise<UnidadeOrganizacionalResponse[]> {
    return api.get<UnidadeOrganizacionalResponse[]>("/unidades-organizacionais");
  },

  buscarPorId(id: number): Promise<UnidadeOrganizacionalResponse> {
    return api.get<UnidadeOrganizacionalResponse>(`/unidades-organizacionais/${id}`);
  },

  criar(data: UnidadeOrganizacionalRequest): Promise<UnidadeOrganizacionalResponse> {
    return api.post<UnidadeOrganizacionalResponse>("/unidades-organizacionais", data);
  },

  atualizar(id: number, data: UnidadeOrganizacionalRequest): Promise<UnidadeOrganizacionalResponse> {
    return api.put<UnidadeOrganizacionalResponse>(`/unidades-organizacionais/${id}`, data);
  },

  ativar(id: number): Promise<UnidadeOrganizacionalResponse> {
    return api.patch<UnidadeOrganizacionalResponse>(`/unidades-organizacionais/${id}/ativar`);
  },

  desativar(id: number): Promise<UnidadeOrganizacionalResponse> {
    return api.patch<UnidadeOrganizacionalResponse>(`/unidades-organizacionais/${id}/desativar`);
  },
};