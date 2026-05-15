import { api } from "./client";

export interface OrgaoResponse {
  id: number;
  nome: string;
  sigla: string;
  codigo: string | null;
  ativo: boolean;
  extinto: boolean;
  extintoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface OrgaoRequest {
  nome: string;
  sigla: string;
  codigo?: string;
}

export const orgaosApi = {
  listarAtivos(): Promise<OrgaoResponse[]> {
    return api.get<OrgaoResponse[]>("/orgaos/ativos");
  },

  listarTodos(): Promise<OrgaoResponse[]> {
    return api.get<OrgaoResponse[]>("/orgaos");
  },

  buscarPorId(id: number): Promise<OrgaoResponse> {
    return api.get<OrgaoResponse>(`/orgaos/${id}`);
  },

  criar(data: OrgaoRequest): Promise<OrgaoResponse> {
    return api.post<OrgaoResponse>("/orgaos", data);
  },

  atualizar(id: number, data: OrgaoRequest): Promise<OrgaoResponse> {
    return api.put<OrgaoResponse>(`/orgaos/${id}`, data);
  },

  ativar(id: number): Promise<OrgaoResponse> {
    return api.patch<OrgaoResponse>(`/orgaos/${id}/ativar`);
  },

  desativar(id: number): Promise<OrgaoResponse> {
    return api.patch<OrgaoResponse>(`/orgaos/${id}/desativar`);
  },

  extinguir(id: number): Promise<OrgaoResponse> {
    return api.patch<OrgaoResponse>(`/orgaos/${id}/extinguir`);
  },

  restabelecer(id: number): Promise<OrgaoResponse> {
    return api.patch<OrgaoResponse>(`/orgaos/${id}/restabelecer`);
  },
};